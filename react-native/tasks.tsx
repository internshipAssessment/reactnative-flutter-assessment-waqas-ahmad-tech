/**
 * React Native Mini Test
 * Assumptions: React Native 0.73+, TypeScript OK (tsx file).
 * Do not add libraries. Use React/React Native only.
 * Implement ONLY inside the TODO blocks.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, TextInput, StyleSheet } from 'react-native';

// ----- Types -----
export type Product = {
  id: string;
  name: string;
  price: number; // integer cents for simplicity
  description: string;
};

// ----- Mock API (provided) -----
async function getProducts(): Promise<Product[]> {
  // Simulate network latency
  await new Promise(r => setTimeout(r, 300));
  return [
    { id: 'p1', name: 'Aurora Lamp', price: 4999, description: 'Ambient smart lamp.' },
    { id: 'p2', name: 'Nebula Speaker', price: 8999, description: '360° sound.' },
    { id: 'p3', name: 'Orbit Charger', price: 2999, description: 'MagSafe-compatible.' },
    { id: 'p4', name: 'Cosmos Watch', price: 19999, description: 'Fitness + notifications.' },
    { id: 'p5', name: 'Luna Buds', price: 5999, description: 'Noise cancelling.' },
  ];
}

// ----- Utility (provided) -----
function formatPriceCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// ========== TASKS START HERE ==========

// Task 1 — Fetch + list + search (FlatList)
// Requirements:
//   - Load products from getProducts() on mount.
//   - Show loading indicator while fetching; show simple error text on failure.
//   - Render a TextInput to filter by name (case-insensitive).
//   - Use a tiny debounce (≈250–400ms) so typing doesn't refetch instantly.
//   - Render a FlatList of filtered items (name + price).
//   - On item press, show a detail view (Task 2) for that product.
export function ProductListScreen() {
  const [all, setAll] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);

  // TODO(1a): Load products with getProducts() on mount (handle loading & error)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await getProducts();
        if (alive) setAll(data);
      } catch (e: any) {
        if (alive) setErr('Failed to load products');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // TODO(1b): Debounce the search query (simple setTimeout) into debouncedQuery
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // TODO(1c): Compute filtered list using debouncedQuery (case-insensitive)
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter(p => p.name.toLowerCase().includes(q));
  }, [all, debouncedQuery]);

  if (loading) {
    return <View style={S.center}><ActivityIndicator /></View>;
  }
  if (err) {
    return <View style={S.center}><Text>{err}</Text></View>;
  }
  if (selected) {
    // Task 2 — Detail view (below)
    return <ProductDetail product={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={S.title}>Products</Text>
      <TextInput
        style={S.input}
        placeholder="Search products..."
        value={query}
        onChangeText={setQuery}
      />

      {/* TODO(1d): FlatList showing filtered items; onPress setSelected(item) */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelected(item)} style={S.card}>
            <Text style={S.name}>{item.name}</Text>
            <Text>{formatPriceCents(item.price)}</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={<Text>No products found.</Text>}
      />
    </View>
  );
}

// Task 2 — Detail view
// Requirements:
//   - Show product name, description, price.
//   - Back button to return to list.
//   - "Add to Cart" button calling addItem(product) from Task 3 hook (below) and showing updated total items.
function ProductDetail({ product, onBack }: { product: Product; onBack: () => void }) {
  const { addItem, totalItems } = useCart();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Pressable onPress={onBack}><Text style={S.link}>{'< Back'}</Text></Pressable>
      <Text style={S.title}>{product.name}</Text>
      <Text style={{ marginVertical: 8 }}>{product.description}</Text>
      <Text style={{ marginBottom: 16 }}>{formatPriceCents(product.price)}</Text>

      {/* TODO(2): Wire up add to cart and show total items */}
      <Pressable style={S.button} onPress={() => addItem(product)}>
        <Text style={S.buttonText}>Add to Cart</Text>
      </Pressable>
      <Text style={{ marginTop: 12 }}>Items in cart: {totalItems()}</Text>
    </View>
  );
}

// Task 3 — Simple cart hook (no libs)
// Requirements:
//   - Keep an internal in-memory cart { [productId]: { product, qty } }.
//   - Expose: addItem(product), removeItem(productId), totalItems().
//   - Keep it module-scoped (shared across screens in this file).
type CartState = Record<string, { product: Product; qty: number }>;
const cartState: CartState = {}; // simple in-memory store

function useCart() {
  // trigger re-renders when cart changes
  const [, setTick] = useState(0);

  function addItem(p: Product) {
    // TODO(3a): increment qty for p.id
    cartState[p.id] = cartState[p.id]
      ? { product: p, qty: cartState[p.id].qty + 1 }
      : { product: p, qty: 1 };
    setTick(x => x + 1);
  }

  function removeItem(productId: string) {
    // TODO(3b): decrement qty or delete when 0
    const entry = cartState[productId];
    if (!entry) return;
    if (entry.qty <= 1) delete cartState[productId];
    else entry.qty -= 1;
    setTick(x => x + 1);
  }

  function totalItems() {
    // TODO(3c): sum all quantities
    return Object.values(cartState).reduce((acc, e) => acc + e.qty, 0);
  }

  return { addItem, removeItem, totalItems };
}

// ----- Minimal styles -----
const S = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  card: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
  name: { fontSize: 16, fontWeight: '600' },
  link: { color: '#3578e5', marginBottom: 12 },
  button: { backgroundColor: '#111', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});
