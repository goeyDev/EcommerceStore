import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageHeader from "../_comnponents/PageHeader";
import { db } from "@/drizzle/db";
import { formatCurrency, formatNumber } from "@/lib/formatter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { DeleteDropDownItem } from "./_components/UserActions";

// function getUsers() {
// const rows = await db
//   .select({
//     userId: userTable.id,
//     email: userTable.email,
//     pricePaidInCents: ordersTable.pricePaidInCents,
//   })
//   .from(userTable)
//   .leftJoin(ordersTable, eq(ordersTable.userId, userTable.id))
//   .orderBy(desc(userTable.createdAt));

// // Group manually
// const grouped = rows.reduce((acc, row) => {
//   const user = acc.find((u) => u.id === row.userId);
//   if (user) {
//     user.orders.push({ pricePaidInCents: row.pricePaidInCents });
//   } else {
//     acc.push({
//       id: row.userId,
//       email: row.email,
//       orders: row.pricePaidInCents ? [{ pricePaidInCents: row.pricePaidInCents }] : [],
//     });
//   }
//   return acc;
// }, []);
// }

// prisma version
// function getUsers() {
//   return db.user.findMany({
//     select: {
//       id: true,
//       email: true,
//       orders: { select: { pricePaidInCents: true } },
//     },
//     orderBy: { createdAt: "desc" },
//   })
// }

export default function Users() {
  return (
    <>
      <PageHeader>Customers</PageHeader>
      <UsersTable />
    </>
  );
}

async function getUsers() {
  const users = await db.query.userTable.findMany({
    columns: {
      id: true,
      email: true,
    },
    with: {
      orders: {
        columns: {
          pricePaidInCents: true,
        },
      },
    },
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });
  return users;
}

async function UsersTable() {
  const users = await getUsers();
  if (users.length == 0) return <p>No records found.</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Value</TableHead>
          <TableHead className="w-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>{formatNumber(user.orders.length)}</TableCell>
            <TableCell>
              {formatCurrency(
                user.orders.reduce((sum, o) => o.pricePaidInCents + sum, 0) /
                  100
              )}
            </TableCell>
            <TableCell className="text-center">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical />
                  <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DeleteDropDownItem id={user.id} />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
