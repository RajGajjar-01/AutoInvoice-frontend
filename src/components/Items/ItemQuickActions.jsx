import { FilePlus, SlidersHorizontal } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import AdjustStock from "./AdjustStock"
import EditItem from "./EditItem"
import DeleteItem from "./DeleteItem"

export function ItemQuickActions({ item, onDeleted }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="flex flex-col gap-2 pt-4">
                <Link to="/create-invoice" search={{ itemId: item.id }}>
                    <Button className="w-full justify-start gap-2">
                        <FilePlus className="h-4 w-4" />
                        Create Document
                    </Button>
                </Link>
                <AdjustStock item={item} variant="button" />
                <Separator className="my-1" />
                <EditItem item={item} onSuccess={() => { }} variant="button" />
                <DeleteItem item={item} onSuccess={onDeleted} variant="button" />
            </CardContent>
        </Card>
    )
}
