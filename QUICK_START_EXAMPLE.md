# Quick Start: Backend Integration Example

This is a complete, working example showing how to migrate a component from the in-memory store to the backend API.

## Before: Using In-Memory Store

```jsx
// src/routes/_layout/data-tables/index.jsx (OLD)
import { useState } from "react"
import { tablesStore } from "@/components/DataTables/tableStore"

function DataTablesPage() {
  const [_tick, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  
  const tables = tablesStore.getAll()
  
  const handleDelete = (id) => {
    tablesStore.remove(id)
    refresh() // Manual refresh needed
  }
  
  const handleDuplicate = (id) => {
    tablesStore.duplicate(id)
    refresh() // Manual refresh needed
  }
  
  const handleRename = (id, newName) => {
    tablesStore.update(id, { name: newName })
    refresh() // Manual refresh needed
  }
  
  return (
    <div>
      <h1>My Tables</h1>
      {tables.map(table => (
        <div key={table.id}>
          <h3>{table.name}</h3>
          <button onClick={() => handleDelete(table.id)}>Delete</button>
          <button onClick={() => handleDuplicate(table.id)}>Duplicate</button>
          <button onClick={() => handleRename(table.id, "New Name")}>Rename</button>
        </div>
      ))}
    </div>
  )
}
```

## After: Using Backend API with Hooks

```jsx
// src/routes/_layout/data-tables/index.jsx (NEW)
import { useDataTables } from "@/hooks/useDataTables"

function DataTablesPage() {
  const { 
    tables, 
    loading, 
    error,
    deleteTable, 
    duplicateTable,
    updateTable 
  } = useDataTables()
  
  // No manual refresh needed - hooks handle it automatically!
  
  const handleDelete = async (id) => {
    await deleteTable(id)
    // Toast notification shown automatically
    // Tables list updated automatically
  }
  
  const handleDuplicate = async (id) => {
    await duplicateTable(id)
    // Toast notification shown automatically
    // Tables list updated automatically
  }
  
  const handleRename = async (id, newName) => {
    await updateTable(id, { name: newName })
    // Toast notification shown automatically
    // Tables list updated automatically
  }
  
  // Show loading state
  if (loading && tables.length === 0) {
    return <div>Loading your tables...</div>
  }
  
  // Show error state
  if (error) {
    return <div>Error: {error.message}</div>
  }
  
  return (
    <div>
      <h1>My Tables</h1>
      {loading && <div className="loading-indicator">Updating...</div>}
      {tables.map(table => (
        <div key={table.id}>
          <h3>{table.name}</h3>
          <button onClick={() => handleDelete(table.id)}>Delete</button>
          <button onClick={() => handleDuplicate(table.id)}>Duplicate</button>
          <button onClick={() => handleRename(table.id, "New Name")}>Rename</button>
        </div>
      ))}
    </div>
  )
}
```

## Key Differences

### 1. No Manual Refresh
**Before:** Had to call `refresh()` after every operation
**After:** Hooks automatically update the state

### 2. Async Operations
**Before:** Synchronous operations
**After:** Async operations with `await`

### 3. Loading States
**Before:** No loading indication
**After:** Built-in `loading` state

### 4. Error Handling
**Before:** No error handling
**After:** Automatic toast notifications + error state

### 5. Type Safety
**Before:** JavaScript only
**After:** Full TypeScript support from OpenAPI

## Complete Example: Table Detail Page

```jsx
// src/routes/_layout/data-tables/$tableId.jsx
import { useParams } from "@tanstack/react-router"
import { useDataTable } from "@/hooks/useDataTables"

function TableDetailPage() {
  const { tableId } = useParams()
  const { 
    table, 
    loading, 
    error,
    addRow,
    updateCell,
    deleteRow,
    bulkDeleteRows
  } = useDataTable(tableId)
  
  if (loading && !table) {
    return <div>Loading table...</div>
  }
  
  if (error) {
    return <div>Error: {error.message}</div>
  }
  
  if (!table) {
    return <div>Table not found</div>
  }
  
  const handleAddRow = async () => {
    const newRowData = {}
    // Initialize with empty values for each column
    table.columns.forEach(col => {
      newRowData[col.name] = ""
    })
    await addRow(newRowData)
  }
  
  const handleCellChange = async (rowId, columnName, value) => {
    await updateCell(rowId, columnName, value)
  }
  
  const handleDeleteRow = async (rowId) => {
    await deleteRow(rowId)
  }
  
  const handleBulkDelete = async (selectedRowIds) => {
    await bulkDeleteRows(selectedRowIds)
  }
  
  return (
    <div>
      <h1>{table.name}</h1>
      <button onClick={handleAddRow}>Add Row</button>
      
      <table>
        <thead>
          <tr>
            {table.columns.map(col => (
              <th key={col.name}>{col.name}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {table.rows?.map(row => (
            <tr key={row.id}>
              {table.columns.map(col => (
                <td key={col.name}>
                  <input
                    value={row.data[col.name] || ""}
                    onChange={(e) => handleCellChange(row.id, col.name, e.target.value)}
                  />
                </td>
              ))}
              <td>
                <button onClick={() => handleDeleteRow(row.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

## Testing Your Integration

### 1. Create a Table
```jsx
const { createTable } = useDataTables()

const newTable = await createTable({
  name: "My Test Table",
  columns: [
    { name: "Name", type: "Text", mandatory: true },
    { name: "Email", type: "Text", mandatory: false }
  ]
})

console.log("Created table:", newTable.id)
```

### 2. Add Rows
```jsx
const { addRow } = useDataTable(tableId)

await addRow({
  "Name": "John Doe",
  "Email": "john@example.com"
})
```

### 3. Update a Cell
```jsx
const { updateCell } = useDataTable(tableId)

await updateCell(rowId, "Email", "newemail@example.com")
```

### 4. Delete a Table
```jsx
const { deleteTable } = useDataTables()

await deleteTable(tableId)
```

## Error Handling Examples

### Handle Specific Errors
```jsx
const handleDelete = async (id) => {
  try {
    await deleteTable(id)
    // Success - toast already shown
  } catch (error) {
    if (error.status === 404) {
      console.log("Table not found")
    } else if (error.status === 403) {
      console.log("Not authorized")
    } else {
      console.log("Unknown error:", error)
    }
  }
}
```

### Disable Button During Loading
```jsx
const { loading, deleteTable } = useDataTables()

<button 
  onClick={() => deleteTable(id)}
  disabled={loading}
>
  {loading ? "Deleting..." : "Delete"}
</button>
```

### Show Loading Spinner
```jsx
const { loading, tables } = useDataTables()

{loading && <Spinner />}
{tables.map(table => ...)}
```

## Common Patterns

### Optimistic Updates
The hooks handle optimistic updates automatically. The UI updates immediately, and if the API call fails, it reverts.

### Debounced Cell Updates
```jsx
import { useDebouncedCallback } from 'use-debounce'

const { updateCell } = useDataTable(tableId)

const debouncedUpdate = useDebouncedCallback(
  (rowId, colName, value) => {
    updateCell(rowId, colName, value)
  },
  500 // Wait 500ms after user stops typing
)

<input
  onChange={(e) => debouncedUpdate(rowId, colName, e.target.value)}
/>
```

### Confirmation Dialogs
```jsx
const handleDelete = async (id) => {
  if (confirm("Are you sure?")) {
    await deleteTable(id)
  }
}
```

## Next Steps

1. Copy one of these examples
2. Replace your existing component code
3. Test in the browser
4. Check the console for any errors
5. Verify data persists after page refresh

## Need Help?

- Check `MIGRATION_GUIDE.md` for detailed instructions
- Review `BACKEND_INTEGRATION_COMPLETE.md` for architecture overview
- Look at test examples in `backend/tests/api/routes/test_tables.py`
- Check API docs at `http://localhost:8000/docs`
