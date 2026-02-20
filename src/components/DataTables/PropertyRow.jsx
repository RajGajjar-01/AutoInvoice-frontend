import { ArrowDown, ArrowUp, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export const COLUMN_TYPES = [
    "Text",
    "Number",
    "Date",
    "Status",
    "Tag",
    "Amount (₹)",
    "Checkbox",
    "Payment Status",
    "Due Date",
    "Expiry Date",
    "Attachment",
    "Dropdown",
];

/**
 * Props:
 *   index       – number
 *   value       – { name, type, mandatory, options: string[] }
 *   onChange    – (index, updatedValue) => void
 *   onRemove    – (index) => void
 *   onMoveUp    – (index) => void
 *   onMoveDown  – (index) => void
 *   canMoveUp   – boolean
 *   canMoveDown – boolean
 */
export function PropertyRow({
    index,
    value,
    onChange,
    onRemove,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown,
}) {
    const update = (patch) => onChange(index, { ...value, ...patch });

    const handleOptionsBlur = (e) => {
        const raw = e.target.value;
        const opts = raw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        update({ options: opts });
    };

    return (
        <div className="flex flex-col gap-1.5">
            {/* Main row */}
            <div className="flex items-center gap-2">
                {/* Drag handle (visual only) */}
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />

                {/* Column name */}
                <Input
                    placeholder="Column name"
                    value={value.name}
                    onChange={(e) => update({ name: e.target.value })}
                    className="flex-1 h-8 text-sm"
                />

                {/* Type select */}
                <Select value={value.type} onValueChange={(type) => update({ type })}>
                    <SelectTrigger className="w-44 h-8 text-sm">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {COLUMN_TYPES.map((type) => (
                            <SelectItem key={type} value={type} className="text-sm">
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Mandatory */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <Checkbox
                        id={`mandatory-${index}`}
                        checked={!!value.mandatory}
                        onCheckedChange={(checked) => update({ mandatory: !!checked })}
                    />
                    <Label htmlFor={`mandatory-${index}`} className="text-xs text-muted-foreground cursor-pointer select-none whitespace-nowrap">
                        Required
                    </Label>
                </div>

                {/* Move up */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => onMoveUp(index)}
                    disabled={!canMoveUp}
                    aria-label="Move column up"
                >
                    <ArrowUp className="h-3.5 w-3.5" />
                </Button>

                {/* Move down */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => onMoveDown(index)}
                    disabled={!canMoveDown}
                    aria-label="Move column down"
                >
                    <ArrowDown className="h-3.5 w-3.5" />
                </Button>

                {/* Remove */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(index)}
                    aria-label="Remove column"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Dropdown options (only for Dropdown type) */}
            {value.type === "Dropdown" && (
                <div className="pl-6">
                    <Input
                        placeholder="Options: e.g. Option A, Option B"
                        defaultValue={(value.options ?? []).join(", ")}
                        onBlur={handleOptionsBlur}
                        className="h-7 text-xs text-muted-foreground"
                    />
                </div>
            )}
        </div>
    );
}

export default PropertyRow;
