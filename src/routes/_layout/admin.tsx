import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense, useMemo } from "react"
import { redirect } from "react-router"
import { AdminService, type UserPublic, UsersService } from "@/client"
import AddUser from "@/components/Admin/AddUser"
import { columns } from "@/components/Admin/columns"
import { DataTable } from "@/components/Common/DataTable"
import PendingUsers from "@/components/Pending/PendingUsers"
import useAuth from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function getUsersQueryOptions() {
  return {
    queryFn: () => AdminService.listUsers({ page: 1, pageSize: 100 }),
    queryKey: ["users"] as const,
  }
}

export async function loader() {
  const user = await UsersService.readUserMe()
  if (!user.is_superuser) {
    throw redirect("/login")
  }
  return null
}

function UsersTableContent() {
  const { user: currentUser } = useAuth()
  const { data: users } = useSuspenseQuery(getUsersQueryOptions())
  const tableData = useMemo(
    () =>
      (users.data as UserPublic[]).map((user) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name ?? undefined,
        is_superuser: user.is_superuser ?? false,
        is_active: user.is_active ?? true,
        isCurrentUser: currentUser?.id === user.id,
      })),
    [currentUser?.id, users.data],
  )
  return <DataTable columns={columns} data={tableData} />
}

function UsersTable() {
  return (
    <Suspense fallback={<PendingUsers />}>
      <UsersTableContent />
    </Suspense>
  )
}

function Admin() {
  useDocumentTitle("Admin")
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Users
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <AddUser />
      </div>
      <UsersTable />
    </div>
  )
}

export default Admin
