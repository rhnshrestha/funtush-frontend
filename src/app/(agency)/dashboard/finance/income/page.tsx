"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const packageOptions = [
  "Everest Base Camp Trek",
  "Annapurna Circuit Classic",
  "Langtang Valley Trek",
  "Manaslu Circuit Trek",
  "Ghorepani Poon Hill Trek",
  "Mardi Himal Trek",
];

const categoryOptions = [
  "Booking Payment",
  "Completed Trek Payment",
  "Add-on Service",
  "Refund Reversal",
  "Other Income",
];
const paymentMethods = [
  "Cash",
  "Bank Transfer",
  "Credit Card",
  "Digital Wallet",
];

function FieldLabel({
  children,
  required = false,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium text-neutral-700"
    >
      {children}
      {required && <span className="ml-1 text-danger-500">*</span>}
    </label>
  );
}

function SelectField({
  id,
  value,
  onChange,
  children,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-3 pr-10 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-700" />
    </div>
  );
}

export default function IncomePage() {
  const router = useRouter();
  const [recordType, setRecordType] = useState("");
  const [date, setDate] = useState("2026-06-05");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [relatedTo, setRelatedTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  const saveRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !recordType ||
      !date ||
      !category ||
      !description.trim() ||
      !paymentMethod
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    const record = {
      id: `inc-${Date.now()}`,
      agency_id: "ag-001",
      amount: 0,
      date,
      category,
      source: relatedTo,
      payment_method: paymentMethod,
      notes: notes.trim(),
      description: description.trim(),
    };
    try {
      const existing = JSON.parse(
        localStorage.getItem("finance-income-records") || "[]",
      ) as unknown[];
      localStorage.setItem(
        "finance-income-records",
        JSON.stringify([...existing, record]),
      );
    } catch {
      // Saving should still complete if local storage is unavailable.
    }
    toast.success("Income record saved successfully.");
    router.push("/dashboard/finance");
  };

  return (
    <div className="space-y-4 w-full">
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard">Dashboard</Link>
          <ChevronRight size={15} />
          <Link
            href="/dashboard/finance"
            className="transition hover:text-neutral-900"
          >
            Finance
          </Link>
          <ChevronRight size={15} />
          <strong className="text-primary-900">Add New Record</strong>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          Add New Record
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Add a new financial record to keep your data updated.
        </p>
      </div>

      <form
        onSubmit={saveRecord}
        className="w-full rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6"
      >
        <div className="border-b border-neutral-200 pb-5">
          <h2 className="text-xl font-bold text-neutral-900">Add new record</h2>
        </div>
        <section className="pt-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <FieldLabel htmlFor="record-type" required>
                Record Type
              </FieldLabel>
              <SelectField
                id="record-type"
                value={recordType}
                onChange={setRecordType}
                placeholder="Select Type"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </SelectField>
            </div>
            <div>
              <FieldLabel htmlFor="record-date" required>
                Date
              </FieldLabel>
              <div className="relative">
                <input
                  id="record-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-neutral-200 bg-white px-3 pr-10 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 [&::-webkit-calendar-picker-indicator]:opacity-0"
                />
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-700" />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="record-category" required>
                Category
              </FieldLabel>
              <SelectField
                id="record-category"
                value={category}
                onChange={setCategory}
                placeholder="Select Type"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="lg:col-span-3">
              <FieldLabel htmlFor="record-description" required>
                Description
              </FieldLabel>
              <textarea
                id="record-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="w-full resize-y rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div className="lg:col-span-2">
              <FieldLabel htmlFor="record-related" required>
                Related to
              </FieldLabel>
              <SelectField
                id="record-related"
                value={relatedTo}
                onChange={setRelatedTo}
                placeholder="Select (Optional)"
              >
                {packageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
            </div>
            <div>
              <FieldLabel htmlFor="record-payment" required>
                Payment Method
              </FieldLabel>
              <SelectField
                id="record-payment"
                value={paymentMethod}
                onChange={setPaymentMethod}
                placeholder="Select payment method"
              >
                {paymentMethods.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="lg:col-span-2">
              <FieldLabel htmlFor="record-notes">
                Notes{" "}
                <span className="font-normal text-neutral-500">(Optional)</span>
              </FieldLabel>
              <textarea
                id="record-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Enter notes"
                className="w-full resize-y rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
        </section>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push("/dashboard/finance")}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-center text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-100"
          >
            Save Record
          </button>
        </div>
      </form>
    </div>
  );
}
