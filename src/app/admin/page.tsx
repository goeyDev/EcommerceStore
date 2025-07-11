import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getProductData,
  getSalesData,
  getUserData,
} from "./_action/adminAction";
import { formatCurrency, formatNumber } from "@/lib/formatter";

export default async function AdminDashboard() {
  const [salesData, userData, productData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProductData(),
  ]);

  console.log(userData);

  console.log("salesData", salesData);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
      <DashboardCard
        title="Sales"
        subtitle={` ${formatCurrency(salesData.amount)} Orders`}
        body={formatNumber(salesData.numberOfSales)}
      />
      <DashboardCard
        title="Customers"
        subtitle={` ${formatNumber(
          userData.averageValuePerUser
        )} Average Value`}
        body={formatCurrency(userData.countUser)}
      />
      <DashboardCard
        title="Products"
        subtitle={` ${formatNumber(productData.countInactive)} Inactive`}
        body={formatCurrency(productData.countActive)}
      />
    </div>
  );
}

type dashboardProps = {
  title: string;
  subtitle: string | number;
  body: string | number;
};
function DashboardCard({ title, subtitle, body }: dashboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="">{body}</p>
      </CardContent>
    </Card>
  );
}
