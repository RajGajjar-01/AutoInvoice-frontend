import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTableModal } from "@/components/DataTables/CreateTableModal";
import { EmptyState } from "@/components/DataTables/EmptyState";
import { TableCard } from "@/components/DataTables/TableCard";
import { TemplateSelector } from "@/components/DataTables/TemplateSelector";
import { tablesStore } from "@/components/DataTables/tableStore";

export const Route = createFileRoute("/_layout/data-tables")({
    component: DataTablesPage,
    head: () => ({
        meta: [{ title: "Data Tables" }],
    }),
});

function DataTablesPage() {
    const navigate = useNavigate();

    // tick counter forces re-renders when the store mutates
    const [tick, setTick] = useState(0);
    const refresh = () => setTick((t) => t + 1);

    const tables = tablesStore.getAll();

    // ── Create modal state ─────────────────────────────────────────────────────
    const [createOpen, setCreateOpen] = useState(false);
    const [createMode, setCreateMode] = useState("blank");   // "blank" | "template"
    const [templateInitial, setTemplateInitial] = useState({ name: "", columns: [] });

    // ── 2-step delete dialog state ─────────────────────────────────────────────
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        tableId: null,
        tableName: "",
        confirmInput: "",
    });

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleCreate = (newTable) => {
        tablesStore.add(newTable);
        refresh();
        setCreateOpen(false);
    };

    const openCreateBlank = () => {
        setCreateMode("blank");
        setTemplateInitial({ name: "", columns: [] });
        setCreateOpen(true);
    };

    const handleSelectTemplate = (template) => {
        setCreateMode("template");
        setTemplateInitial({ name: template.name, columns: template.columns });
        setCreateOpen(true);
    };

    const handleDeleteRequest = (id) => {
        const t = tablesStore.getById(id);
        if (!t) return;
        setDeleteDialog({ open: true, tableId: id, tableName: t.name, confirmInput: "" });
    };

    const handleDeleteConfirm = () => {
        tablesStore.remove(deleteDialog.tableId);
        refresh();
        setDeleteDialog({ open: false, tableId: null, tableName: "", confirmInput: "" });
    };

    const handleRename = (id, name) => {
        tablesStore.update(id, { name });
        refresh();
    };

    const handleDuplicate = (id) => {
        tablesStore.duplicate(id);
        refresh();
    };

    const handleOpen = (id) => {
        navigate({ to: "/data-tables/$tableId", params: { tableId: id } });
    };

    const deleteNameMatches = deleteDialog.confirmInput.trim() === deleteDialog.tableName;

    return (
        <div className="flex flex-col gap-6">
            {/* ── Page Header ───────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Your Data Tables</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create and manage structured data for your business
                    </p>
                </div>
                <Button onClick={openCreateBlank}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Table
                </Button>
            </div>

            {/* ── Tabs ──────────────────────────────────── */}
            <Tabs defaultValue="my-tables">
                <TabsList>
                    <TabsTrigger value="my-tables">My Tables</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="my-tables" className="mt-6">
                    {tables.length === 0 ? (
                        <EmptyState onCreateClick={openCreateBlank} />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {tables.map((table) => (
                                <TableCard
                                    key={table.id}
                                    table={table}
                                    onDelete={handleDeleteRequest}
                                    onRename={handleRename}
                                    onDuplicate={handleDuplicate}
                                    onOpen={handleOpen}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="templates" className="mt-6">
                    <TemplateSelector onSelectTemplate={handleSelectTemplate} />
                </TabsContent>
            </Tabs>

            {/* ── Create Modal ───────────────────────────── */}
            <CreateTableModal
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSubmit={handleCreate}
                mode={createMode}
                initialName={templateInitial.name}
                initialColumns={templateInitial.columns}
            />

            {/* ── 2-step Delete Dialog ───────────────────── */}
            <Dialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog((d) => ({ ...d, open, confirmInput: open ? d.confirmInput : "" }))
                }
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete table?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete{" "}
                            <span className="font-semibold text-foreground">
                                &ldquo;{deleteDialog.tableName}&rdquo;
                            </span>{" "}
                            and all its data. Type the table name below to confirm.
                        </DialogDescription>
                    </DialogHeader>

                    <Input
                        placeholder={deleteDialog.tableName}
                        value={deleteDialog.confirmInput}
                        onChange={(e) =>
                            setDeleteDialog((d) => ({ ...d, confirmInput: e.target.value }))
                        }
                    />

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                setDeleteDialog((d) => ({ ...d, open: false, confirmInput: "" }))
                            }
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={!deleteNameMatches}
                            onClick={handleDeleteConfirm}
                        >
                            Delete permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default DataTablesPage;
