"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import finance from "../../../../../data/finance.json";
import {
  ArrowUp,
  CalendarDays,
  ChevronDown,
  Download,
  Landmark,
  PackageCheck,
  Plus,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";

const agencyId = "ag-001";
const currency = {
  format: (amount: number) => `Rs. ${amount.toLocaleString("en-IN")}`,
};
const compactCurrency = (amount: number) =>
  Math.abs(amount) >= 1000
    ? `Rs. ${(amount / 1000).toFixed(1)}k`
    : currency.format(amount);

function Sparkline({ color, points }: { color: string; points: number[] }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const line = points
    .map(
      (point, index) =>
        `${(index / (points.length - 1)) * 100},${35 - ((point - min) / range) * 27}`,
    )
    .join(" ");
  const gradientId = `spark-${color.replace("#", "")}`;
  return (
    <svg
      viewBox="0 0 100 40"
      className="h-16 w-40 shrink-0"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".42" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,38 ${line} 100,38`} fill={`url(#${gradientId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OverviewCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "violet" | "rose" | "green" | "orange";
}) {
  const colors = {
    violet: ["border-primary-400", "bg-primary-100", "text-primary-600"],
    rose: ["border-danger-400", "bg-danger-100", "text-danger-500"],
    green: ["border-success-400", "bg-success-100", "text-success-600"],
    orange: ["border-warning-500", "bg-warning-100", "text-warning-600"],
  }[tone];
  return (
    <article
      className={`relative min-h-44 overflow-hidden rounded-xl border bg-white p-5 shadow-sm ${colors[0]}`}
    >
      <div
        className={`absolute -right-7 -top-7 h-24 w-24 rounded-full opacity-70 ${colors[1]}`}
      />
      <div
        className={`absolute -bottom-12 right-8 h-20 w-20 rounded-full opacity-45 ${colors[1]}`}
      />
      <div className="relative flex h-full flex-col">
        <span
          className={`ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg ${colors[1]} ${colors[2]}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <p className="-mt-9 text-sm font-semibold text-neutral-900">{label}</p>
        <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-950">
          {value}
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-neutral-700">
          {tone === "violet" || tone === "green" ? (
            <ArrowUp className="h-4 w-4" />
          ) : null}
          {detail}
        </p>
      </div>
    </article>
  );
}

function SummaryCard({
  label,
  value,
  change,
  color,
  points,
}: {
  label: string;
  value: string;
  change: string;
  color: string;
  points: number[];
}) {
  return (
    <article className="flex min-h-48 flex-col justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-neutral-900">{label}</h2>
        <Download className="h-4 w-4 text-neutral-600" aria-hidden="true" />
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-neutral-950">{value}</p>
          <p className="mt-1 text-sm font-medium text-success-600">
            <span aria-hidden="true">up </span>
            {change}
          </p>
          <p className="mt-3 text-sm text-neutral-500">vs last month</p>
        </div>
        <Sparkline color={color} points={points} />
      </div>
    </article>
  );
}

export default function AgencyFinancePage() {
  const [period, setPeriod] = useState("Weekly");
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const metrics = useMemo(() => {
    const income = finance.income.filter((item) => item.agency_id === agencyId);
    const expenses = finance.expenses.filter(
      (item) => item.agency_id === agencyId,
    );
    const invoices = finance.invoices.filter(
      (item) => item.agency_id === agencyId,
    );
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const pendingInvoices = invoices.filter((item) => item.status !== "Paid");
    const outstanding = pendingInvoices.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const bySource = income.reduce<
      Record<string, { revenue: number; bookings: number }>
    >((result, item) => {
      const key = item.source || "Other packages";
      result[key] ??= { revenue: 0, bookings: 0 };
      result[key].revenue += item.amount;
      result[key].bookings += 1;
      return result;
    }, {});
    const packages = Object.entries(bySource)
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
    return {
      income,
      expenses,
      totalIncome,
      totalExpenses,
      outstanding,
      pendingInvoices,
      packages,
    };
  }, []);
  const profit = metrics.totalIncome - metrics.totalExpenses;
  const profitMargin = metrics.totalIncome
    ? Math.round((profit / metrics.totalIncome) * 100)
    : 0;
  const highestPackageRevenue = metrics.packages[0]?.revenue || 1;
  const payroll = metrics.expenses
    .filter((item) => item.category === "Guide Fee")
    .reduce((sum, item) => sum + item.amount, 0);
  const permits = metrics.expenses
    .filter((item) => item.category === "Permits")
    .reduce((sum, item) => sum + item.amount, 0);
  const profitRows = [
    {
      label: "Trek Revenue",
      value: metrics.totalIncome,
      tone: "text-success-600",
    },
    { label: "Add-on Revenue", value: 0, tone: "text-success-600" },
    { label: "Guide Payroll", value: -payroll, tone: "text-danger-500" },
    { label: "Permits & Fees", value: -permits, tone: "text-danger-500" },
  ];
  const exportReport = () => {
    const rows = [
      ["Metric", "Amount"],
      ["Revenue", String(metrics.totalIncome)],
      ["Expenses", String(metrics.totalExpenses)],
      ["Net profit", String(profit)],
      ["Outstanding invoices", String(metrics.outstanding)],
    ];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "finance-overview.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6 pb-6">
      <header className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Finance</h1>
          <nav
            className="mt-2 flex items-center gap-2 text-sm"
            aria-label="Breadcrumb"
          >
            <span className="text-neutral-500">Finance</span>
            <span className="text-neutral-400">›</span>
            <span className="font-semibold text-primary-600">Overview</span>
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportReport}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50"
          >
            <Download className="h-4 w-4" /> Export
          </button>
          <Link
            href="/dashboard/finance/income"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" /> Record income
          </Link>
        </div>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          label="Revenue (August)"
          value={compactCurrency(metrics.totalIncome)}
          detail="8% from July"
          icon={WalletCards}
          tone="violet"
        />
        <OverviewCard
          label="Expenses (August)"
          value={compactCurrency(metrics.totalExpenses)}
          detail="Guides, permits & operations"
          icon={ReceiptText}
          tone="rose"
        />
        <OverviewCard
          label="Net Profit"
          value={compactCurrency(profit)}
          detail={`${profitMargin}% margin`}
          icon={Landmark}
          tone="green"
        />
        <OverviewCard
          label="Invoices Pending"
          value={String(metrics.pendingInvoices.length)}
          detail={`${currency.format(metrics.outstanding)} outstanding`}
          icon={ReceiptText}
          tone="orange"
        />
      </section>
      <section>
        <h2 className="mb-3 text-base font-semibold text-neutral-950">
          Summarized Result
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <SummaryCard
            label="Gross Revenue"
            value={currency.format(metrics.totalIncome)}
            change="11.9%"
            color="#f97316"
            points={[18, 24, 20, 30, 26, 37, 34, 51]}
          />
          <SummaryCard
            label="Total Bookings"
            value={String(metrics.income.length)}
            change="11.9%"
            color="#84cc16"
            points={[16, 28, 26, 38, 32, 44, 41, 58]}
          />
          <SummaryCard
            label="Net Profit"
            value={currency.format(profit)}
            change="8.3%"
            color="#84cc16"
            points={[15, 22, 20, 28, 24, 33, 31, 48]}
          />
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.03fr)_minmax(0,1fr)]">
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-medium text-neutral-900">
                P&amp;L Summary{" "}
                <span className="text-neutral-500">— August 2026</span>
              </h2>
              <div className="mt-2 flex items-end gap-3">
                <p className="text-4xl font-semibold tracking-tight text-neutral-950">
                  {currency.format(profit)}
                </p>
                <p className="mb-1 text-sm font-medium text-neutral-700">
                  ↑ {profitMargin}%
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPeriodOpen((open) => !open)}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  {period}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isPeriodOpen && (
                  <div className="absolute right-0 z-10 mt-1 w-28 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg">
                    {["Weekly", "Monthly"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setPeriod(option);
                          setIsPeriodOpen(false);
                        }}
                        className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-neutral-50"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={exportReport}
                className="rounded-lg border border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
              >
                Export
              </button>
            </div>
          </div>
          <div className="mt-4 border-t border-dashed border-neutral-300 pt-4">
            <svg
              viewBox="0 0 620 180"
              className="h-40 w-full"
              preserveAspectRatio="none"
              aria-label={`${period} profit trend`}
              role="img"
            >
              <defs>
                <linearGradient id="profit-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6c72ff" stopOpacity=".45" />
                  <stop offset="100%" stopColor="#6c72ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line
                x1="0"
                y1="36"
                x2="620"
                y2="36"
                stroke="#d4d4d8"
                strokeDasharray="6 7"
              />
              <path
                d="M12 154 C55 142,80 157,117 149 S172 105,216 88 S280 69,320 75 S365 76,397 60 S455 47,486 28 S550 14,608 8 L608 180 L12 180 Z"
                fill="url(#profit-area)"
              />
              <path
                d="M12 154 C55 142,80 157,117 149 S172 105,216 88 S280 69,320 75 S365 76,397 60 S455 47,486 28 S550 14,608 8"
                fill="none"
                stroke="#3f51f5"
                strokeLinecap="round"
                strokeWidth="5"
              />
              <line
                x1="402"
                y1="10"
                x2="402"
                y2="180"
                stroke="#5264ff"
                strokeWidth="1.5"
              />
              <circle cx="402" cy="59" r="12" fill="#3f51f5" />
            </svg>
          </div>
          <dl className="mt-3 divide-y divide-neutral-200">
            {profitRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-3 text-sm"
              >
                <dt className="font-medium text-neutral-500">{row.label}</dt>
                <dd className={`font-semibold ${row.tone}`}>
                  {row.value >= 0 ? "+" : "-"}
                  {currency.format(Math.abs(row.value))}
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 text-base">
              <dt className="font-semibold text-neutral-950">Net Profit</dt>
              <dd className="font-semibold text-primary-600">
                {currency.format(profit)}
              </dd>
            </div>
          </dl>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100 sm:p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-950">
              Top Packages by Revenue
            </h2>
          </div>
          <div className="mt-5 space-y-4">
            {metrics.packages.length ? (
              metrics.packages.map((item, index) => (
                <div key={item.name}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {item.bookings} booking{item.bookings === 1 ? "" : "s"}{" "}
                        · avg.{" "}
                        {currency.format(
                          Math.round(item.revenue / item.bookings),
                        )}
                      </p>
                    </div>
                    <p className="font-semibold text-primary-600">
                      {currency.format(item.revenue)}
                    </p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-danger-400 via-warning-400 to-primary-500"
                      style={{
                        width: `${Math.max(12, (item.revenue / highestPackageRevenue) * 100)}%`,
                      }}
                    />
                  </div>
                  {index < metrics.packages.length - 1 && (
                    <div className="mt-4 border-b border-neutral-100" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500">
                No package revenue recorded yet.
              </p>
            )}
          </div>
          <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-primary-50 text-xs font-medium text-neutral-700">
                <tr>
                  <th className="px-3 py-3">No.</th>
                  <th className="px-3 py-3">Package</th>
                  <th className="px-3 py-3">Bookings</th>
                  <th className="px-3 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {metrics.packages.map((item, index) => (
                  <tr key={item.name} className="border-t border-neutral-100">
                    <td className="px-3 py-2.5 text-neutral-500">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-neutral-700">
                      {item.name}
                    </td>
                    <td className="px-3 py-2.5 text-neutral-600">
                      {item.bookings}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-primary-600">
                      {currency.format(item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniStat
              icon={PackageCheck}
              label="Total Packages"
              value={String(metrics.packages.length)}
              detail="Active"
              tone="violet"
            />
            <MiniStat
              icon={CalendarDays}
              label="Total Bookings"
              value={String(metrics.income.length)}
              detail="This month"
              tone="green"
            />
            <MiniStat
              icon={ShieldCheck}
              label="Avg. Revenue"
              value={currency.format(
                metrics.income.length
                  ? Math.round(metrics.totalIncome / metrics.income.length)
                  : 0,
              )}
              detail="Per booking"
              tone="violet"
            />
          </div>
        </article>
      </section>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  tone: "violet" | "green";
}) {
  const color =
    tone === "green"
      ? "bg-success-100 text-success-700"
      : "bg-primary-100 text-primary-600";
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${color}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold text-neutral-800">{label}</p>
          <p className="mt-0.5 text-xl font-semibold text-neutral-950">
            {value}
          </p>
        </div>
      </div>
      <p className="mt-2 text-right text-xs text-neutral-500">{detail}</p>
    </div>
  );
}
