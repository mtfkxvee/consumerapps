import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  alt: string;
  qty: number;
  selected: boolean;
};

type AddInput = Omit<CartItem, "qty" | "selected">;

type CartContextValue = {
  items: CartItem[];
  add: (item: AddInput) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  toggleSelected: (id: string) => void;
  selectAll: (selected: boolean) => void;
  clear: () => void;
  total: number;
  selectedTotal: number;
  count: number;
  allSelected: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (item: AddInput) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1, selected: true }];
    });
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const setQty = (id: string, qty: number) => {
    if (qty <= 0) return remove(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const toggleSelected = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)));

  const selectAll = (selected: boolean) =>
    setItems((prev) => prev.map((i) => ({ ...i, selected })));

  const clear = () => setItems([]);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const selectedTotal = useMemo(
    () => items.filter((i) => i.selected).reduce((sum, i) => sum + i.price * i.qty, 0),
    [items],
  );
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const allSelected = items.length > 0 && items.every((i) => i.selected);

  return (
    <CartContext.Provider
      value={{
        items,
        add,
        remove,
        setQty,
        toggleSelected,
        selectAll,
        clear,
        total,
        selectedTotal,
        count,
        allSelected,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
