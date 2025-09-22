import React, { useContext, useMemo, useState } from "react";
import { ContractsContext } from "../context/ContractsContext";

function isValidAddress(addr) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr || "");
}

export default function ContractsPanel() {
  const { contracts, current, selected, add, remove, select } = useContext(ContractsContext);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState(null);

  const canAdd = useMemo(() => name.trim().length > 0 && isValidAddress(address), [name, address]);

  const onAdd = (e) => {
    e.preventDefault();
    setError(null);
    if (!canAdd) {
      setError("Enter a valid name and address");
      return;
    }
  const entry = { name: name.trim(), address: address.trim() };
  add(entry);
    setName("");
    setAddress("");
  };

  return (
    <div>
      <h3>Contracts</h3>
  <form onSubmit={onAdd} className="row">
        <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="0x..." value={address} onChange={(e) => setAddress(e.target.value)} style={{ minWidth: 360 }} />
        <button type="submit" disabled={!canAdd}>Add</button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}

  <ul>
        {contracts.map((c) => (
          <li key={c.address} style={{ marginTop: 8 }}>
            <label style={{ cursor: "pointer" }}>
              <input type="radio" name="contract" checked={selected && selected.toLowerCase() === c.address.toLowerCase()} onChange={() => select(c.address)} />
              <strong style={{ marginLeft: 8 }}>{c.name}</strong> — {c.address}
            </label>
            <button onClick={() => remove(c.address)} style={{ marginLeft: 12 }}>Delete</button>
          </li>
        ))}
      </ul>

      {current && (
        <div style={{ marginTop: 8, color: "#555" }}>Selected: {current.name} ({current.address})</div>
      )}
    </div>
  );
}
