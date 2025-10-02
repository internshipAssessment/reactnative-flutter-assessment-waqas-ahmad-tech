/*
 * Flutter Assessment
 * Assumptions: Flutter 3.x, Dart 3.x, MaterialApp.
 * Do not add packages. Use built-in Material + Navigator only.
 * Implement ONLY inside the TODO blocks.
 */

import 'package:flutter/material.dart';

// ----- Model -----
class Product {
  final String id;
  final String name;
  final int price; // integer cents
  final String description;

  Product({required this.id, required this.name, required this.price, required this.description});
}

// ----- Mock API (provided) -----
class MockApi {
  static Future<List<Product>> getProducts() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return [
      Product(id: 'p1', name: 'Aurora Lamp', price: 4999, description: 'Ambient smart lamp.'),
      Product(id: 'p2', name: 'Nebula Speaker', price: 8999, description: '360° sound.'),
      Product(id: 'p3', name: 'Orbit Charger', price: 2999, description: 'MagSafe-compatible.'),
      Product(id: 'p4', name: 'Cosmos Watch', price: 19999, description: 'Fitness + notifications.'),
      Product(id: 'p5', name: 'Luna Buds', price: 5999, description: 'Noise cancelling.'),
    ];
  }
}

// ----- Utility (provided) -----
String money(int cents) => '\$${(cents / 100).toStringAsFixed(2)}';

// ========== TASKS START HERE ==========

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({ super.key });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Mini Test',
      theme: ThemeData(useMaterial3: true),
      home: const ProductListPage(),
    );
  }
}

// Task 1 — Product list + search + loading/error
// Requirements:
//   - On init, load products from MockApi.getProducts().
//   - Show CircularProgressIndicator while loading; show simple error text on failure.
//   - Add a TextField to filter by name (case-insensitive).
//   - Show ListView of filtered products (name + price).
//   - On tap, push ProductDetailPage(product).
class ProductListPage extends StatefulWidget {
  const ProductListPage({ super.key });

  @override
  State<ProductListPage> createState() => _ProductListPageState();
}

class _ProductListPageState extends State<ProductListPage> {
  List<Product> _all = [];
  bool _loading = false;
  String? _error;
  final TextEditingController _query = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
    _query.addListener(() => setState(() {}));
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final data = await MockApi.getProducts();
      setState(() { _all = data; });
    } catch (e) {
      setState(() { _error = 'Failed to load products'; });
    } finally {
      setState(() { _loading = false; });
    }
  }

  List<Product> get _filtered {
    final q = _query.text.trim().toLowerCase();
    if (q.isEmpty) return _all;
    return _all.where((p) => p.name.toLowerCase().contains(q)).toList();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_error != null) {
      return Scaffold(body: Center(child: Text(_error!)));
    }
    return Scaffold(
      appBar: AppBar(title: const Text('Products')),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            TextField(
              controller: _query,
              decoration: const InputDecoration(
                hintText: 'Search products...',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.separated(
                itemCount: _filtered.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, i) {
                  final p = _filtered[i];
                  return ListTile(
                    title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Text(money(p.price)),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => ProductDetailPage(product: p)),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Task 2 — Cart (simple in-memory) + detail page
// Requirements:
//   - Create a Cart class (below) that stores { productId: qty } and exposes:
//       add(Product), remove(Product), totalItems (int), totalPrice (int cents).
//   - In ProductDetailPage, show product info and an "Add to Cart" button.
//   - On add, update a global cart and show a SnackBar with updated totals.
//   - AppBar on detail shows current total items in cart.
final Cart cart = Cart();

class Cart {
  final Map<String, int> _qty = {};

  void add(Product p) {
    // TODO(2a): increment quantity for p.id
    _qty[p.id] = (_qty[p.id] ?? 0) + 1;
  }

  void remove(Product p) {
    // TODO(2b): decrement or delete when 0
    if (!_qty.containsKey(p.id)) return;
    final next = (_qty[p.id]! - 1);
    if (next <= 0) {
      _qty.remove(p.id);
    } else {
      _qty[p.id] = next;
    }
  }

  int get totalItems {
    // TODO(2c): sum quantities
    return _qty.values.fold(0, (a, b) => a + b);
  }

  int totalPrice(List<Product> products) {
    // TODO(2d): sum price * qty for items present in products
    final byId = { for (final p in products) p.id: p };
    int cents = 0;
    _qty.forEach((id, q) {
      final p = byId[id];
      if (p != null) cents += p.price * q;
    });
    return cents;
  }
}

class ProductDetailPage extends StatefulWidget {
  final Product product;
  const ProductDetailPage({ super.key, required this.product });

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  int _badge = cart.totalItems;

  void _add() {
    // TODO(2e): add to cart, update badge, show SnackBar
    cart.add(widget.product);
    setState(() { _badge = cart.totalItems; });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Added • Items in cart: $_badge')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.product.name),
        actions: [
          Center(child: Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Text('🛒 $_badge'),
          )),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.product.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text(widget.product.description),
            const SizedBox(height: 12),
            Text(money(widget.product.price), style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _add,
              child: const Text('Add to Cart'),
            ),
          ],
        ),
      ),
    );
  }
}
