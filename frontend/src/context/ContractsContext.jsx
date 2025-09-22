import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "beaglegaze.contracts.v1";

export const ContractsContext = createContext({});

export function ContractsProvider({ children }) {
  const [contracts, setContracts] = useState([]); // {name, address, depositMethod?}
  const [selected, setSelected] = useState(null); // address

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data.contracts)) setContracts(data.contracts);
        if (data.selected) setSelected(data.selected);
      }
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ contracts, selected }));
    } catch {}
  }, [contracts, selected]);

  const add = useCallback((entry) => {
    setContracts((prev) => {
      const exists = prev.some((c) => c.address.toLowerCase() === entry.address.toLowerCase());
      const next = exists ? prev.map((c) => (c.address.toLowerCase() === entry.address.toLowerCase() ? { ...c, ...entry } : c)) : [...prev, entry];
      if (!selected) setSelected(entry.address);
      return next;
    });
  }, [selected]);

  const remove = useCallback((address) => {
    setContracts((prev) => prev.filter((c) => c.address.toLowerCase() !== address.toLowerCase()));
    setSelected((prev) => (prev && prev.toLowerCase() === address.toLowerCase() ? null : prev));
  }, []);

  const select = useCallback((address) => setSelected(address), []);

  const current = useMemo(() => contracts.find((c) => c.address.toLowerCase() === (selected || "").toLowerCase()) || null, [contracts, selected]);

  const value = useMemo(() => ({ contracts, selected, current, add, remove, select }), [contracts, selected, current, add, remove, select]);

  return <ContractsContext.Provider value={value}>{children}</ContractsContext.Provider>;
}
