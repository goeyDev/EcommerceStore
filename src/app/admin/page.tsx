import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  console.log("test");
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
      <DashboardCard
        title="Sales"
        subtitle={` ${formatCurrency(salesData.amount)} Orders`}
        body={formatNumber(salesData.amount)}
      />
      <DashboardCard
        title="Customers"
        subtitle={` ${formatCurrency(
          userData.averageValuePerUser
        )} Average Value`}
        body={formatNumber(userData.countUser)}
      />
      <DashboardCard
        title="Products"
        subtitle={` ${formatNumber(productData.countInactive)} Inactive`}
        body={formatNumber(productData.countActive)}
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
