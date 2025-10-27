
import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../../../configFirebase";
import { LuCalendarClock, LuDownload, LuHistory, LuRefreshCw, LuUpload } from "react-icons/lu";
const daysOfWeek = [
  { key: "monday", label: "Lunes", salaryFactor: 1, goalFactor: 1 },
  { key: "tuesday", label: "Martes", salaryFactor: 1, goalFactor: 1 },
  { key: "wednesday", label: "Miércoles", salaryFactor: 1, goalFactor: 1 },
  { key: "thursday", label: "Jueves", salaryFactor: 1, goalFactor: 1 },
  { key: "friday", label: "Viernes", salaryFactor: 1, goalFactor: 1 },
  { key: "saturday", label: "Sábado", salaryFactor: 0.5, goalFactor: 0.5 },
  { key: "sunday", label: "Domingo", salaryFactor: 0, goalFactor: 0 },
];
const tabs = [
  ...daysOfWeek,
  { key: "weekly", label: "Resumen semanal" },
  { key: "monthly", label: "Resumen mensual" },
  { key: "history", label: "Histórico" },
];
const storageKeys = {
  dailySalary: "financial.dailySalary",
  dailyGoal: "financial.dailyGoal",
  manualData: "financial.manualData",
  history: "financial.history",
  activeWeekStart: "financial.activeWeekStart",
};
const isBrowser = typeof window !== "undefined";
const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});
const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);
const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;
const createEmptyManualWeek = () => {
  const manual = {};
  daysOfWeek.forEach(({ key }) => {
    manual[key] = { income: 0, expense: 0, expenses: [] };
  });
  return manual;
};
const normalizeManualDay = (value) => {
  if (!value) {
    return { income: 0, expense: 0, expenses: [] };
  }
  const expenses = Array.isArray(value.expenses)
    ? value.expenses.map((item) => ({
        note: item?.note?.toString() ?? "",
        amount: Number(item?.amount) || 0,
      }))
    : [];
  const expenseTotal =
    expenses.length > 0
      ? expenses.reduce((acc, item) => acc + (Number(item.amount) || 0), 0)
      : Number(value.expense) || 0;
  return {
    income: Number(value.income) || 0,
    expense: expenseTotal,
    expenses,
  };
};
const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};
const getWeekStart = (date) => {
  const normalized = normalizeDate(date);
  const day = normalized.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  normalized.setDate(normalized.getDate() + diff);
  return normalized;
};
const addDays = (date, amount) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};
const toDateKey = (date) => {
  const normalized = normalizeDate(date);
  const offsetMs = normalized.getTimezoneOffset() * 60 * 1000;
  return new Date(normalized.getTime() - offsetMs).toISOString().slice(0, 10);
};
const parseDateKey = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};
const monthKey = (date) =>
  date.toLocaleDateString("es-AR", { year: "numeric", month: "long" });
const getStored = (key, fallback) => {
  if (!isBrowser) return fallback;
  const raw = window.localStorage.getItem(key);
  return raw ?? fallback;
};
const getStoredNumber = (key, fallback) => {
  const value = Number(getStored(key, fallback));
  return Number.isFinite(value) ? value : fallback;
};
const getStoredJSON = (key, fallback) => {
  try {
    const raw = getStored(key, null);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`No se pudo parsear ${key}`, error);
    return fallback;
  }
};
const FinancialDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [dailySalary, setDailySalary] = useState(() =>
    getStoredNumber(storageKeys.dailySalary, 0)
  );
  const [dailyGoal, setDailyGoal] = useState(() =>
    getStoredNumber(storageKeys.dailyGoal, 0)
  );
  const [manualData, setManualData] = useState(() =>
    getStoredJSON(storageKeys.manualData, {})
  );
  const [history, setHistory] = useState(() =>
    getStoredJSON(storageKeys.history, [])
  );
  const [activeWeekStart, setActiveWeekStart] = useState(() => {
    const stored = getStored(storageKeys.activeWeekStart, null);
    return stored ?? toDateKey(getWeekStart(new Date()));
  });
  const [activeTab, setActiveTab] = useState(daysOfWeek[0].key);
  const [expenseDrafts, setExpenseDrafts] = useState({});
  const fileInputRef = useRef(null);
  const persist = (key, value) => {
    if (!isBrowser) return;
    window.localStorage.setItem(key, value);
  };
  useEffect(() => {
    if (!manualData[activeWeekStart]) {
      setManualData((prev) => ({
        ...prev,
        [activeWeekStart]: createEmptyManualWeek(),
      }));
    }
  }, [activeWeekStart, manualData]);
  useEffect(() => {
    persist(storageKeys.dailySalary, String(dailySalary));
  }, [dailySalary]);
  useEffect(() => {
    persist(storageKeys.dailyGoal, String(dailyGoal));
  }, [dailyGoal]);
  useEffect(() => {
    persist(storageKeys.manualData, JSON.stringify(manualData));
  }, [manualData]);
  useEffect(() => {
    persist(storageKeys.history, JSON.stringify(history));
  }, [history]);
  useEffect(() => {
    persist(storageKeys.activeWeekStart, activeWeekStart);
  }, [activeWeekStart]);
  const fetchOrders = async () => {
    setIsFetchingOrders(true);
    setOrdersError("");
    try {
      const startDate = addDays(getWeekStart(new Date()), -84);
      const ordersRef = collection(db, "orders");
      const salesQuery = query(
        ordersRef,
        where("createdAt", ">=", Timestamp.fromDate(startDate)),
        orderBy("createdAt")
      );
      const snapshot = await getDocs(salesQuery);
      const parsed = snapshot.docs
        .map((docSnapshot) => {
          const data = docSnapshot.data();
          const rawCreatedAt = data.createdAt;
          let createdAt = null;
          if (rawCreatedAt?.toDate) createdAt = rawCreatedAt.toDate();
          else if (rawCreatedAt?.seconds)
            createdAt = new Date(rawCreatedAt.seconds * 1000);
          if (!createdAt) return null;
          return {
            id: docSnapshot.id,
            total: Number(data.total) || 0,
            seller: data.seller || "",
            paymentMethod: data.paymentMethod || "",
            createdAt,
            items: Array.isArray(data.items) ? data.items : [],
          };
        })
        .filter(Boolean);
      setOrders(parsed);
    } catch (error) {
      console.error("Error al cargar las ventas", error);
      setOrdersError("No se pudieron cargar las ventas recientes.");
    } finally {
      setIsFetchingOrders(false);
    }
  };
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setProductsError("");
    try {
      const productSnapshot = await getDocs(collection(db, "products"));
      const productList = productSnapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));
      setProducts(productList);
    } catch (error) {
      console.error("Error al cargar los productos", error);
      setProductsError(
        `No se pudieron cargar los productos: ${error.message ?? "error desconocido"}`
      );
    } finally {
      setIsLoadingProducts(false);
    }
  };
  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);
  const ordersByWeek = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      const weekStart = getWeekStart(order.createdAt);
      const weekKey = toDateKey(weekStart);
      if (!map[weekKey]) {
        map[weekKey] = {
          start: weekStart,
          end: addDays(weekStart, 6),
          days: {},
        };
        daysOfWeek.forEach(({ key }) => {
          map[weekKey].days[key] = { totalSales: 0, orders: [] };
        });
      }
      const dayIndex = (order.createdAt.getDay() + 6) % 7;
      const dayKey = daysOfWeek[dayIndex].key;
      map[weekKey].days[dayKey].totalSales += order.total;
      map[weekKey].days[dayKey].orders.push(order);
    });
    return map;
  }, [orders]);
  const activeWeekStartDate = parseDateKey(activeWeekStart);
  const weekData = ordersByWeek[activeWeekStart];
  const daySummaries = useMemo(() => {
    const manualWeek = manualData[activeWeekStart] ?? createEmptyManualWeek();
    return daysOfWeek.map((day) => {
      const salaryFactor = day.salaryFactor ?? 1;
      const goalFactor = day.goalFactor ?? 1;
      const dayOrders = weekData?.days?.[day.key] ?? { totalSales: 0, orders: [] };
      const manualValues = normalizeManualDay(manualWeek[day.key]);
      const expenseItems = Array.isArray(manualValues.expenses)
        ? manualValues.expenses
        : [];
      const expenseFromItems = expenseItems.reduce(
        (acc, item) => acc + (Number(item.amount) || 0),
        0
      );
      const sales = dayOrders.totalSales;
      const manualIncome = Number(manualValues.income) || 0;
      const manualExpense =
        expenseItems.length > 0 ? expenseFromItems : Number(manualValues.expense) || 0;
      const totalIncome = sales + manualIncome;
      const salaryAmount = dailySalary * salaryFactor;
      const goalTarget = dailyGoal * goalFactor;
      const net = totalIncome - manualExpense - salaryAmount;
      return {
        key: day.key,
        label: day.label,
        salaryFactor,
        goalFactor,
        salaryAmount,
        sales,
        manualIncome,
        manualExpense,
        totalIncome,
        net,
        orders: dayOrders.orders,
        expenses: expenseItems,
        goalTarget,
      };
    });
  }, [weekData, manualData, activeWeekStart, dailySalary, dailyGoal]);
  const weeklyTotals = useMemo(() => {
    const totals = daySummaries.reduce(
      (acc, day) => {
        acc.sales += day.sales;
        acc.manualIncome += day.manualIncome;
        acc.manualExpense += day.manualExpense;
        acc.totalIncome += day.totalIncome;
        acc.net += day.net;
        acc.salary += day.salaryAmount;
        acc.goal += day.goalTarget;
        return acc;
      },
      {
        sales: 0,
        manualIncome: 0,
        manualExpense: 0,
        totalIncome: 0,
        net: 0,
        salary: 0,
        goal: 0,
      }
    );
    const totalSalary = totals.salary;
    const weeklyGoal = totals.goal;
    const ownerNet = totals.totalIncome - totals.manualExpense - totalSalary;
    const goalDiff = totals.totalIncome - weeklyGoal;
    const completion = weeklyGoal > 0 ? (totals.totalIncome / weeklyGoal) * 100 : 0;
    const { salary, goal, ...rest } = totals;
    return {
      ...rest,
      totalSalary,
      weeklyGoal,
      ownerNet,
      goalDiff,
      completion,
    };
  }, [daySummaries]);
  const monthSummary = useMemo(() => {
    const currentMonthKey = monthKey(activeWeekStartDate);
    const aggregate = {
      totalIncome: 0,
      totalExpense: 0,
      totalSalary: 0,
      ownerNet: 0,
      objective: 0,
      weeks: 0,
    };
    const addWeek = (totals) => {
      aggregate.totalIncome += totals.totalIncome || 0;
      aggregate.totalExpense += totals.manualExpense || 0;
      aggregate.totalSalary += totals.totalSalary || 0;
      aggregate.ownerNet += totals.ownerNet || 0;
      aggregate.objective += totals.weeklyGoal || 0;
      aggregate.weeks += 1;
    };
    history.forEach((entry) => {
      const entryStart = parseDateKey(entry.weekStart);
      if (monthKey(entryStart) !== currentMonthKey) return;
      addWeek(entry.totals || {});
    });
    addWeek(weeklyTotals);
    const difference = aggregate.totalIncome - aggregate.objective;
    const completion =
      aggregate.objective > 0
        ? (aggregate.totalIncome / aggregate.objective) * 100
        : 0;
    return {
      ...aggregate,
      difference,
      completion,
      monthLabel: currentMonthKey,
    };
  }, [history, activeWeekStartDate, weeklyTotals]);
  const handleManualChange = (dayKey, field, value) => {
    const numeric = Number(value);
    setManualData((prev) => {
      const next = { ...prev };
      const week = { ...(next[activeWeekStart] ?? createEmptyManualWeek()) };
      const day = normalizeManualDay(week[dayKey]);
      if (field === "income") {
        day.income = Number.isFinite(numeric) ? numeric : 0;
      } else if (field === "expense") {
        const expenseValue = Number.isFinite(numeric) ? numeric : 0;
        day.expense = expenseValue;
        day.expenses = [];
      }
      week[dayKey] = day;
      next[activeWeekStart] = week;
      return next;
    });
  };
  const handleExpenseDraftChange = (dayKey, field, value) => {
    setExpenseDrafts((prev) => {
      const draft = prev[dayKey] ?? { amount: "", note: "" };
      return {
        ...prev,
        [dayKey]: { ...draft, [field]: value },
      };
    });
  };
  const handleAddExpense = (dayKey) => {
    const draft = expenseDrafts[dayKey] ?? { amount: "", note: "" };
    const amount = Number(draft.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert("Ingresá un monto válido para el gasto.");
      return;
    }
    const note = draft.note?.toString().trim() ?? "";
    setManualData((prev) => {
      const next = { ...prev };
      const week = { ...(next[activeWeekStart] ?? createEmptyManualWeek()) };
      const day = normalizeManualDay(week[dayKey]);
      const expenses = Array.isArray(day.expenses) ? [...day.expenses] : [];
      if (expenses.length === 0 && day.expense > 0) {
        expenses.push({
          amount: Number(day.expense) || 0,
          note: "Total previo sin detalle",
        });
      }
      expenses.push({ amount, note });
      const totalExpense = expenses.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      );
      day.expenses = expenses;
      day.expense = totalExpense;
      week[dayKey] = day;
      next[activeWeekStart] = week;
      return next;
    });
    setExpenseDrafts((prev) => ({
      ...prev,
      [dayKey]: { amount: "", note: "" },
    }));
  };
  const handleRemoveExpense = (dayKey, index) => {
    setManualData((prev) => {
      const next = { ...prev };
      const week = { ...(next[activeWeekStart] ?? createEmptyManualWeek()) };
      const day = normalizeManualDay(week[dayKey]);
      const expenses = Array.isArray(day.expenses) ? [...day.expenses] : [];
      if (index < 0 || index >= expenses.length) {
        return prev;
      }
      expenses.splice(index, 1);
      const totalExpense = expenses.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      );
      day.expenses = expenses;
      day.expense = totalExpense;
      week[dayKey] = day;
      next[activeWeekStart] = week;
      return next;
    });
  };
  const handleNewWeek = () => {
    if (!window.confirm("Guardar la semana actual e iniciar una nueva?")) {
      return;
    }
    setHistory((prev) => [
      ...prev,
      {
        weekNumber: prev.length + 1,
        weekStart: activeWeekStart,
        weekEnd: toDateKey(addDays(activeWeekStartDate, 6)),
        generatedAt: new Date().toISOString(),
        totals: weeklyTotals,
        manualData: manualData[activeWeekStart] ?? createEmptyManualWeek(),
      },
    ]);
    const nextWeek = toDateKey(addDays(activeWeekStartDate, 7));
    setManualData((prev) => {
      const next = { ...prev };
      delete next[activeWeekStart];
      if (!next[nextWeek]) next[nextWeek] = createEmptyManualWeek();
      return next;
    });
    setActiveWeekStart(nextWeek);
    setActiveTab(daysOfWeek[0].key);
  };
  const handleExport = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      dailySalary,
      dailyGoal,
      activeWeekStart,
      manualData,
      history,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `control-financiero-${activeWeekStart}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const parsed = JSON.parse(loadEvent.target?.result ?? "{}");
        if (parsed.dailySalary !== undefined)
          setDailySalary(Number(parsed.dailySalary) || 0);
        if (parsed.dailyGoal !== undefined)
          setDailyGoal(Number(parsed.dailyGoal) || 0);
        if (parsed.manualData) setManualData(parsed.manualData);
        if (parsed.history) setHistory(parsed.history);
        if (parsed.activeWeekStart) setActiveWeekStart(parsed.activeWeekStart);
        window.alert("Datos importados correctamente.");
      } catch (error) {
        console.error("No se pudo importar el archivo", error);
        window.alert("El archivo seleccionado no es válido.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };
  const handleClearHistory = () => {
    if (window.confirm("Esto eliminará todas las semanas guardadas. Continuar?")) {
      setHistory([]);
    }
  };
  const isDayTab = daysOfWeek.some((day) => day.key === activeTab);
  const renderDayTab = (dayKey) => {
    const day = daySummaries.find((entry) => entry.key === dayKey);
    if (!day) return null;
    const manualWeek = manualData[activeWeekStart] ?? createEmptyManualWeek();
    const manualValues = normalizeManualDay(manualWeek[dayKey]);
    const expenseDraft = expenseDrafts[dayKey] ?? { amount: "", note: "" };
    const expenseItems = Array.isArray(manualValues.expenses)
      ? manualValues.expenses
      : [];
    const hasLegacyExpense = expenseItems.length === 0 && manualValues.expense > 0;
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card bg-base-100 shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold">{day.label}</h2>
          <p className="text-sm text-base-content/70">
            Ajustá los ingresos o gastos manuales si hubo movimientos fuera del checkout.
          </p>
          <label className="form-control">
            <span className="label-text">Ingresos adicionales</span>
            <input
              type="number"
              min="0"
              className="input input-bordered"
              value={manualValues.income}
              onChange={(event) =>
                handleManualChange(dayKey, "income", event.target.value)
              }
            />
          </label>
          <div className="form-control space-y-2">
            <span className="label-text">Registrar gasto</span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="number"
                min="0"
                placeholder="Monto"
                className="input input-bordered w-full sm:max-w-[140px]"
                value={expenseDraft.amount ?? ""}
                onChange={(event) =>
                  handleExpenseDraftChange(dayKey, "amount", event.target.value)
                }
              />
              <input
                type="text"
                placeholder="Descripci�n"
                className="input input-bordered flex-1"
                value={expenseDraft.note ?? ""}
                onChange={(event) =>
                  handleExpenseDraftChange(dayKey, "note", event.target.value)
                }
              />
              <button
                type="button"
                className="btn btn-primary sm:w-auto"
                onClick={() => handleAddExpense(dayKey)}
              >
                Agregar
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Gastos registrados</p>
            {expenseItems.length > 0 ? (
              <ul className="space-y-2">
                {expenseItems.map((item, index) => (
                  <li
                    key={`${dayKey}-expense-${index}`}
                    className="flex items-start justify-between gap-3 rounded-lg border border-base-200 p-3"
                  >
                    <div>
                      <p className="font-semibold">{formatCurrency(item.amount)}</p>
                      {item.note && (
                        <p className="text-xs text-base-content/70">{item.note}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost text-error"
                      onClick={() => handleRemoveExpense(dayKey, index)}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            ) : hasLegacyExpense ? (
              <p className="text-sm text-base-content/70">
                Total registrado sin detalle: {formatCurrency(manualValues.expense)}
              </p>
            ) : (
              <p className="text-sm text-base-content/60">
                Todav�a no registraste gastos manuales.
              </p>
            )}
          </div>
        </div>
        <div className="card bg-base-100 shadow-md p-6 space-y-2">
          <h3 className="text-xl font-semibold">Resumen</h3>
          <p>Ventas (checkout): {formatCurrency(day.sales)}</p>
          <p>Ingresos manuales: {formatCurrency(day.manualIncome)}</p>
          <p>Gastos: {formatCurrency(day.manualExpense)}</p>
          <p>Sueldo aplicado: {formatCurrency(day.salaryAmount)}</p>
          <p>Objetivo del d�a: {formatCurrency(day.goalTarget)}</p>
          <p className="font-semibold">Ganancia neta: {formatCurrency(day.net)}</p>
          <p className="text-sm text-base-content/70">
            Diferencia vs objetivo diario: {formatCurrency(day.totalIncome - day.goalTarget)}
          </p>
        </div>
        <div className="card bg-base-100 shadow-md lg:col-span-2">
          <div className="card-body">
            <h3 className="card-title">Ventas del día</h3>
            {day.orders.length === 0 ? (
              <p className="text-sm text-base-content/70">
                No hay ventas registradas en checkout para este día.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Total</th>
                      <th>Vendedora</th>
                      <th>Método de pago</th>
                      <th>Productos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.orders
                      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                      .map((order) => (
                        <tr key={order.id}>
                          <td>
                            {order.createdAt.toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td>{formatCurrency(order.total)}</td>
                          <td>{order.seller || "-"}</td>
                          <td>{order.paymentMethod || "-"}</td>
                          <td>
                            {order.items.length === 0 ? (
                              <span className="text-sm text-base-content/60">
                                Sin detalle
                              </span>
                            ) : (
                              <ul className="list-disc pl-4 space-y-1 text-sm">
                                {order.items.map((item, index) => (
                                  <li key={`${order.id}-${index}`}>
                                    {item.quantity} x {item.title}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderWeeklyTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="stat bg-success/10 rounded-lg">
          <div className="stat-title">Ingresos totales</div>
          <div className="stat-value text-success">
            {formatCurrency(weeklyTotals.totalIncome)}
          </div>
          <div className="stat-desc">
            Ventas checkout: {formatCurrency(weeklyTotals.sales)}
          </div>
        </div>
        <div className="stat bg-error/10 rounded-lg">
          <div className="stat-title">Gastos</div>
          <div className="stat-value text-error">
            {formatCurrency(weeklyTotals.manualExpense)}
          </div>
        </div>
        <div className="stat bg-info/10 rounded-lg">
          <div className="stat-title">Sueldos</div>
          <div className="stat-value text-info">
            {formatCurrency(weeklyTotals.totalSalary)}
          </div>
        </div>
        <div className="stat bg-primary/10 rounded-lg">
          <div className="stat-title">Ganancia del dueño</div>
          <div className="stat-value text-primary">
            {formatCurrency(weeklyTotals.ownerNet)}
          </div>
        </div>
      </div>
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h3 className="card-title">Objetivo semanal</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-sm text-base-content/70">Objetivo</p>
              <p className="text-xl font-semibold">
                {formatCurrency(weeklyTotals.weeklyGoal)}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Diferencia</p>
              <p
                className={`text-xl font-semibold ${
                  weeklyTotals.goalDiff >= 0 ? "text-success" : "text-error"
                }`}
              >
                {formatCurrency(weeklyTotals.goalDiff)}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Cumplimiento</p>
              <p className="text-xl font-semibold">
                {formatPercent(weeklyTotals.completion)}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Estado</p>
              <p
                className={`text-xl font-semibold ${
                  weeklyTotals.goalDiff >= 0 ? "text-success" : "text-error"
                }`}
              >
                {weeklyTotals.goalDiff >= 0 ? "Objetivo alcanzado" : "Bajo el objetivo"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h3 className="card-title">Detalle diario</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Ingresos</th>
                  <th>Objetivo</th>
                  <th>Diferencia</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {daySummaries.map((day) => {
                  const diff = day.totalIncome - day.goalTarget;
                  return (
                    <tr key={day.key}>
                      <td>{day.label}</td>
                      <td>{formatCurrency(day.totalIncome)}</td>
                      <td>{formatCurrency(day.goalTarget)}</td>
                      <td>{formatCurrency(diff)}</td>
                      <td className={diff >= 0 ? "text-success" : "text-error"}>
                        {diff >= 0 ? "Sobre el objetivo" : "Bajo el objetivo"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
  const renderMonthlyTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="stat bg-success/10 rounded-lg">
          <div className="stat-title">Ingresos del mes</div>
          <div className="stat-value text-success">
            {formatCurrency(monthSummary.totalIncome)}
          </div>
        </div>
        <div className="stat bg-error/10 rounded-lg">
          <div className="stat-title">Gastos del mes</div>
          <div className="stat-value text-error">
            {formatCurrency(monthSummary.totalExpense)}
          </div>
        </div>
        <div className="stat bg-info/10 rounded-lg">
          <div className="stat-title">Sueldos</div>
          <div className="stat-value text-info">
            {formatCurrency(monthSummary.totalSalary)}
          </div>
        </div>
        <div className="stat bg-primary/10 rounded-lg">
          <div className="stat-title">Ganancia neta mensual</div>
          <div className="stat-value text-primary">
            {formatCurrency(monthSummary.ownerNet)}
          </div>
        </div>
      </div>
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h3 className="card-title">Objetivo mensual</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-sm text-base-content/70">Objetivo acumulado</p>
              <p className="text-xl font-semibold">
                {formatCurrency(monthSummary.objective)}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Semanas registradas</p>
              <p className="text-xl font-semibold">{monthSummary.weeks}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Diferencia</p>
              <p
                className={`text-xl font-semibold ${
                  monthSummary.difference >= 0 ? "text-success" : "text-error"
                }`}
              >
                {formatCurrency(monthSummary.difference)}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Cumplimiento</p>
              <p className="text-xl font-semibold">
                {formatPercent(monthSummary.completion)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const renderHistoryTab = () => {
    if (history.length === 0) {
      return (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title">Histórico</h3>
            <p className="text-sm text-base-content/70">
              Aún no guardaste semanas. Usá &quot;Nueva semana&quot; para archivar la actual.
            </p>
          </div>
        </div>
      );
    }
    const sortedHistory = [...history].sort((a, b) => b.weekNumber - a.weekNumber);
    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h3 className="card-title">Histórico</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Semana</th>
                  <th>Rango</th>
                  <th>Ingresos</th>
                  <th>Gastos</th>
                  <th>Sueldos</th>
                  <th>Ganancia neta</th>
                  <th>Objetivo</th>
                  <th>Cumplimiento</th>
                </tr>
              </thead>
              <tbody>
                {sortedHistory.map((entry) => {
                  const totals = entry.totals || {};
                  const completion =
                    totals.weeklyGoal > 0
                      ? (totals.totalIncome / totals.weeklyGoal) * 100
                      : 0;
                  return (
                    <tr key={entry.weekStart}>
                      <td>Semana {entry.weekNumber}</td>
                      <td>
                        {parseDateKey(entry.weekStart).toLocaleDateString("es-AR")} -
                        {" "}
                        {parseDateKey(entry.weekEnd).toLocaleDateString("es-AR")}
                      </td>
                      <td>{formatCurrency(totals.totalIncome)}</td>
                      <td>{formatCurrency(totals.manualExpense)}</td>
                      <td>{formatCurrency(totals.totalSalary)}</td>
                      <td>{formatCurrency(totals.ownerNet)}</td>
                      <td>{formatCurrency(totals.weeklyGoal)}</td>
                      <td>{formatPercent(completion)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Control financiero del local</h1>
          <p className="text-sm text-base-content/70">
            Semana actual: {activeWeekStart} - {toDateKey(addDays(activeWeekStartDate, 6))}
          </p>
          <p className="text-sm text-base-content/70">
            Histórico guardado: {history.length} semanas
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-success" onClick={handleNewWeek}>
            <LuCalendarClock className="mr-2 h-4 w-4" />
            Nueva semana
          </button>
          <button type="button" className="btn btn-outline" onClick={fetchOrders}>
            <LuRefreshCw className="mr-2 h-4 w-4" />
            Recargar ventas
          </button>
          <button type="button" className="btn btn-outline" onClick={handleExport}>
            <LuDownload className="mr-2 h-4 w-4" />
            Exportar
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <LuUpload className="mr-2 h-4 w-4" />
            Importar
          </button>
          <button type="button" className="btn btn-error" onClick={handleClearHistory}>
            <LuHistory className="mr-2 h-4 w-4" />
            Limpiar histórico
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="card bg-base-100 shadow-md p-4 form-control">
          <span className="label-text font-semibold">Sueldo diario</span>
          <input
            type="number"
            min="0"
            className="input input-bordered"
            value={dailySalary}
            onChange={(event) => setDailySalary(Number(event.target.value) || 0)}
          />
        </label>
        <label className="card bg-base-100 shadow-md p-4 form-control">
          <span className="label-text font-semibold">Objetivo diario</span>
          <input
            type="number"
            min="0"
            className="input input-bordered"
            value={dailyGoal}
            onChange={(event) => setDailyGoal(Number(event.target.value) || 0)}
          />
        </label>
        <div className="card bg-base-100 shadow-md p-4">
          <p className="text-sm text-base-content/70">Ventas semanales</p>
          <p className="text-2xl font-bold">{formatCurrency(weeklyTotals.sales)}</p>
        </div>
        <div className="card bg-base-100 shadow-md p-4">
          <p className="text-sm text-base-content/70">Ganancia neta proyectada</p>
          <p className="text-2xl font-bold">{formatCurrency(weeklyTotals.ownerNet)}</p>
        </div>
      </div>
      <div className="card bg-base-100 shadow-md">
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="card-title">Inventario actual</h3>
            <button type="button" className="btn btn-sm btn-outline" onClick={fetchProducts}>
              Recargar productos
            </button>
          </div>
          {productsError && <p className="text-sm text-error">{productsError}</p>}
          {isLoadingProducts ? (
            <div className="flex items-center space-x-2 text-sm text-base-content/70">
              <span className="loading loading-spinner loading-sm" />
              <span>Cargando productos...</span>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-72">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-sm text-base-content/60">
                        No hay productos registrados.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td className="whitespace-nowrap">
                          {product.title || product.name || "(sin nombre)"}
                        </td>
                        <td className="capitalize">{product.category || "-"}</td>
                        <td>{product.stock ?? "-"}</td>
                        <td>{formatCurrency(product.price)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {ordersError && (
        <div className="alert alert-error">
          <span>{ordersError}</span>
        </div>
      )}
      {isFetchingOrders && (
        <div className="alert alert-info">
          <span>Cargando ventas del checkout...</span>
        </div>
      )}
      <div className="tabs tabs-boxed w-full overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab whitespace-nowrap ${activeTab === tab.key ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {isDayTab && renderDayTab(activeTab)}
        {!isDayTab && activeTab === "weekly" && renderWeeklyTab()}
        {!isDayTab && activeTab === "monthly" && renderMonthlyTab()}
        {!isDayTab && activeTab === "history" && renderHistoryTab()}
      </div>
    </div>
  );
};
export default FinancialDashboard;
