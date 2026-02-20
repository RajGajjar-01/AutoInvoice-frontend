import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TableCard({ table, onDelete, onRename, onDuplicate, onOpen }) {
    const handleRename = () => {
        const newName = window.prompt("Rename table:", table.name);
        if (newName && newName.trim() && newName.trim() !== table.name) {
            onRename(table.id, newName.trim());
        }
    };

    const previewColumns = table.columns.slice(0, 4);

    return (
        <div
            className="group relative aspect-square cursor-pointer"
            onClick={() => onOpen?.(table.id)}
        >
            <Card className="h-full w-full rounded-xl border shadow-sm transition-all duration-200 group-hover:shadow-md overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2 pt-4 px-4">
                    <CardTitle className="text-sm font-semibold truncate leading-snug">
                        {table.name}
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Table options</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRename(); }}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(table.id); }}>
                                <Copy className="mr-2 h-3.5 w-3.5" />
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); onDelete(table.id); }}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>

                <CardContent className="flex flex-col gap-1.5 px-4 pb-4">
                    {previewColumns.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No columns</p>
                    ) : (
                        previewColumns.map((col, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between gap-2 rounded bg-muted px-2 py-1"
                            >
                                <span className="text-xs text-muted-foreground truncate">
                                    {col.name || "Untitled"}
                                </span>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                                    {col.type}
                                </Badge>
                            </div>
                        ))
                    )}
                    {table.columns.length > 4 && (
                        <p className="text-xs text-muted-foreground mt-1">
                            +{table.columns.length - 4} more column{table.columns.length - 4 > 1 ? "s" : ""}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-xl flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto bg-background/60 backdrop-blur-[1px]">
                <Button
                    variant="secondary"
                    size="sm"
                    className="shadow-sm"
                    onClick={(e) => { e.stopPropagation(); onOpen?.(table.id); }}
                >
                    Open table →
                </Button>
            </div>
        </div>
    );
}

export default TableCard;
