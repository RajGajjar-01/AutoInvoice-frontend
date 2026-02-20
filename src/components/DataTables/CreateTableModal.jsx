import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PropertyRow } from "./PropertyRow";

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const formSchema = z.object({
    tableName: z.string().min(1, "Table name is required"),
});

// ─── Quick-add field presets ──────────────────────────────────────────────────
const QUICK_ADD_FIELDS = [
    { name: "Client Name", type: "Text" },
    { name: "Amount", type: "Amount (₹)" },
    { name: "Due Date", type: "Due Date" },
    { name: "Status", type: "Status" },
    { name: "Notes", type: "Text" },
];

const makeColumn = (name = "", type = "Text") => ({
    name,
    type,
    mandatory: false,
    options: [],
});

/**
 * Props:
 *   open           – boolean
 *   onOpenChange   – (open: boolean) => void
 *   onSubmit       – ({ name, columns }) => void
 *   mode           – "blank" | "template"   (default "blank")
 *   initialName    – string                 (default "")
 *   initialColumns – column[]               (default [])
 */
export function CreateTableModal({
    open,
    onOpenChange,
    onSubmit,
    mode = "blank",
    initialName = "",
    initialColumns = [],
}) {
    const getInitialCols = () =>
        initialColumns.length > 0
            ? initialColumns.map((c) => makeColumn(c.name, c.type, c.mandatory, c.options))
            : [makeColumn()];

    const [columns, setColumns] = useState(getInitialCols);
    const [columnsError, setColumnsError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { tableName: initialName },
    });

    // Re-initialise when modal opens (mode or initialColumns may change)
    useEffect(() => {
        if (open) {
            form.reset({ tableName: initialName });
            setColumns(
                initialColumns.length > 0
                    ? initialColumns.map((c) => ({
                        name: c.name ?? "",
                        type: c.type ?? "Text",
                        mandatory: c.mandatory ?? false,
                        options: c.options ?? [],
                    }))
                    : [makeColumn()]
            );
            setColumnsError("");
            setIsSubmitting(false);
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Sync isSubmitting with modal state ────────────────────────────────────
    useEffect(() => {
        if (!open) setIsSubmitting(false);
    }, [open]);

    // ── Column handlers ───────────────────────────────────────────────────────
    const handleColumnChange = (index, updated) => {
        setColumns((prev) => prev.map((col, i) => (i === index ? updated : col)));
        if (columnsError) setColumnsError("");
    };

    const handleColumnRemove = (index) => {
        setColumns((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddColumn = () => {
        setColumns((prev) => [...prev, makeColumn()]);
    };

    const handleMoveUp = (index) => {
        if (index === 0) return;
        setColumns((prev) => {
            const next = [...prev];
            [next[index - 1], next[index]] = [next[index], next[index - 1]];
            return next;
        });
    };

    const handleMoveDown = (index) => {
        setColumns((prev) => {
            if (index === prev.length - 1) return prev;
            const next = [...prev];
            [next[index], next[index + 1]] = [next[index + 1], next[index]];
            return next;
        });
    };

    // ── Quick-add ─────────────────────────────────────────────────────────────
    const handleQuickAdd = (preset) => {
        if (columns.some((c) => c.name === preset.name)) return; // already exists
        setColumns((prev) => [...prev, makeColumn(preset.name, preset.type)]);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = form.handleSubmit((data) => {
        if (columns.length === 0) {
            setColumnsError("Add at least one column.");
            return;
        }

        // Validate: no duplicate column names
        const names = columns.map((c) => c.name.trim()).filter(Boolean);
        if (new Set(names).size !== names.length) {
            setColumnsError("Column names must be unique.");
            return;
        }

        // Validate: Dropdown type must have options
        const dropdownWithoutOpts = columns.find(
            (c) => c.type === "Dropdown" && (c.options ?? []).length === 0
        );
        if (dropdownWithoutOpts) {
            setColumnsError(
                `"${dropdownWithoutOpts.name || "Dropdown"}" column needs at least one option.`
            );
            return;
        }

        setIsSubmitting(true);
        onSubmit({ name: data.tableName, columns });
    });

    const watchedName = form.watch("tableName");
    const previewColumns = columns.filter((c) => c.name.trim());

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "template" ? "Create Table from Template" : "Create New Table"}
                    </DialogTitle>
                    <DialogDescription>
                        Define your table name and columns. Add or reorder fields as needed.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Two-column layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* ── LEFT: Form ────────────────────────────── */}
                            <div className="flex flex-col gap-4">
                                <FormField
                                    control={form.control}
                                    name="tableName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Table Name{" "}
                                                <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. Invoice Tracker"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                {/* Column builder */}
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-medium">Columns</p>

                                    <div className="flex flex-col gap-2">
                                        {columns.map((col, i) => (
                                            <PropertyRow
                                                key={i}
                                                index={i}
                                                value={col}
                                                onChange={handleColumnChange}
                                                onRemove={handleColumnRemove}
                                                onMoveUp={handleMoveUp}
                                                onMoveDown={handleMoveDown}
                                                canMoveUp={i > 0}
                                                canMoveDown={i < columns.length - 1}
                                                total={columns.length}
                                            />
                                        ))}
                                    </div>

                                    {columnsError && (
                                        <p className="text-xs text-destructive">{columnsError}</p>
                                    )}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddColumn}
                                        className="mt-1 w-fit"
                                    >
                                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                                        Add Column
                                    </Button>
                                </div>
                            </div>

                            {/* ── RIGHT: Preview + Quick-add ────────────── */}
                            <div className="hidden md:flex flex-col gap-4">
                                {/* Live preview */}
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Live Preview
                                    </p>
                                    <Card className="overflow-hidden border rounded-lg">
                                        {previewColumns.length === 0 ? (
                                            <div className="flex items-center justify-center py-10 text-xs text-muted-foreground">
                                                Add columns to see a preview
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="hover:bg-transparent">
                                                            {previewColumns.map((col, i) => (
                                                                <TableHead
                                                                    key={i}
                                                                    className="text-xs whitespace-nowrap"
                                                                >
                                                                    {col.name}
                                                                    {col.mandatory && (
                                                                        <span className="text-destructive ml-0.5">*</span>
                                                                    )}
                                                                </TableHead>
                                                            ))}
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {[0, 1].map((rowIdx) => (
                                                            <TableRow key={rowIdx}>
                                                                {previewColumns.map((_, colIdx) => (
                                                                    <TableCell
                                                                        key={colIdx}
                                                                        className="text-xs text-muted-foreground"
                                                                    >
                                                                        —
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                        {watchedName && (
                                            <div className="border-t px-3 py-2 bg-muted/40">
                                                <p className="text-xs text-muted-foreground">
                                                    Table:{" "}
                                                    <span className="font-medium text-foreground">
                                                        {watchedName}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </Card>
                                </div>

                                {/* Quick-add fields */}
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Quick Add Fields
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {QUICK_ADD_FIELDS.map((preset) => {
                                            const alreadyAdded = columns.some(
                                                (c) => c.name === preset.name
                                            );
                                            return (
                                                <Button
                                                    key={preset.name}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs h-7"
                                                    onClick={() => handleQuickAdd(preset)}
                                                    disabled={alreadyAdded}
                                                >
                                                    <Plus className="mr-1 h-3 w-3" />
                                                    {preset.name}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-2">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <LoadingButton type="submit" loading={isSubmitting}>
                                {mode === "template" ? "Create from Template" : "Create Table"}
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateTableModal;
