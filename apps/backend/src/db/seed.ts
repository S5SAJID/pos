import { db } from ".";
import { auth } from "../lib/auth";
import * as schema from "./schema";

/**
 * Seed database with realistic Pakistani retail store data
 * - Profit margins: 15-30% (typical for retail)
 * - Monthly revenue target: ~600,000 PKR
 * - Monthly expenses: ~115,000 PKR
 * - Expected gross profit: ~140,000 PKR (covers expenses + net profit)
 */
export async function seedDatabase() {
  try {
    console.log("Starting database seed...");

    // Create test user
    const createdUser = await auth.api.signUpEmail({
      body: {
        email: "hayakhan.45@gmail.com",
        name: "Haya K.",
        password: "idontknowwhyiusedhayasname",
      },
    });

    console.log("✓ User created");

    // Create realistic Pakistani store products with proper margins
    const createdProducts = await db
      .insert(schema.products)
      .values([
        // Beverages & Tea (20-25% margin)
        {
          name: "Tapal Danedar 950g",
          sku: "TAP-950",
          price: "1450.00",
          cost: "1200.00",
        },
        {
          name: "Lipton Yellow 950g",
          sku: "LIP-950",
          price: "1380.00",
          cost: "1150.00",
        },
        {
          name: "Olpers Milk 1L",
          sku: "OLP-1L",
          price: "290.00",
          cost: "250.00",
        },
        {
          name: "Nestle Milk 1L",
          sku: "NES-1L",
          price: "280.00",
          cost: "245.00",
        },

        // Spices & Masalas (25-30% margin)
        {
          name: "Shan Biryani 50g",
          sku: "SHN-BIR-50",
          price: "130.00",
          cost: "95.00",
        },
        {
          name: "Shan Nihari 50g",
          sku: "SHN-NIH-50",
          price: "135.00",
          cost: "98.00",
        },
        {
          name: "National Salt 800g",
          sku: "NAT-SLT",
          price: "65.00",
          cost: "48.00",
        },
        {
          name: "Dalda Oil 1L",
          sku: "DLD-OIL",
          price: "520.00",
          cost: "450.00",
        },

        // Bakery (15-20% margin)
        {
          name: "Dawn Bread Large",
          sku: "DWN-BRD",
          price: "160.00",
          cost: "135.00",
        },
        { name: "Nimco Rusk", sku: "NMC-RSK", price: "180.00", cost: "155.00" },

        // Cleaning (20-25% margin)
        {
          name: "Surf Excel 1kg",
          sku: "SRF-1K",
          price: "680.00",
          cost: "550.00",
        },
        { name: "Ariel 1kg", sku: "ARL-1K", price: "720.00", cost: "580.00" },
        {
          name: "Harpic 500ml",
          sku: "HRP-500",
          price: "280.00",
          cost: "230.00",
        },
        { name: "Vim Bar", sku: "VIM-BAR", price: "45.00", cost: "32.00" },

        // Rice & Grains (15-20% margin)
        {
          name: "Basmati 5kg",
          sku: "RIC-BAS-5K",
          price: "1850.00",
          cost: "1600.00",
        },
        {
          name: "Sella Rice 5kg",
          sku: "RIC-SEL-5K",
          price: "1650.00",
          cost: "1450.00",
        },

        // Snacks (25-30% margin)
        {
          name: "Peek Freans Sooper",
          sku: "PKF-SPR",
          price: "120.00",
          cost: "90.00",
        },
        {
          name: "Kolson Slanty",
          sku: "KOL-SLN",
          price: "60.00",
          cost: "45.00",
        },
        { name: "Lays Chips", sku: "LAY-CHP", price: "80.00", cost: "60.00" },

        // Personal Care (20-25% margin)
        {
          name: "Lux Soap 3pk",
          sku: "LUX-3PK",
          price: "210.00",
          cost: "175.00",
        },
        { name: "Lifebuoy Soap", sku: "LFB-SP", price: "75.00", cost: "58.00" },
        {
          name: "Closeup 150g",
          sku: "CLU-150",
          price: "240.00",
          cost: "195.00",
        },

        // Additional essentials
        {
          name: "Atta 10kg",
          sku: "ATT-10K",
          price: "1450.00",
          cost: "1280.00",
        },
        { name: "Sugar 1kg", sku: "SGR-1K", price: "140.00", cost: "120.00" },
      ])
      .returning({
        id: schema.products.id,
        price: schema.products.price,
        cost: schema.products.cost,
        name: schema.products.name,
      });

    console.log(`✓ Created ${createdProducts.length} products`);

    // Initialize inventory with realistic stock levels
    await db.insert(schema.inventory).values(
      createdProducts.map((product) => {
        // Higher stock for fast-moving items, lower for slow-moving
        const baseStock =
          product.name.includes("Milk") || product.name.includes("Bread")
            ? 80
            : 50;
        const variance = Math.floor(Math.random() * 40);

        return {
          productId: product.id,
          quantity: baseStock + variance,
          minStockLevel:
            product.name.includes("Milk") || product.name.includes("Bread")
              ? 20
              : 15,
        };
      }),
    );

    console.log("✓ Initialized inventory");

    // Realistic monthly expenses (Total: 115,000 PKR)
    await db.insert(schema.expenses).values([
      { amount: "35000.00", category: "RENT", description: "Shop Rent" },
      { amount: "8500.00", category: "UTILITIES", description: "Bijli Bill" },
      { amount: "4200.00", category: "UTILITIES", description: "Gas Bill" },
      {
        amount: "45000.00",
        category: "SALARIES",
        description: "Malik Tankhwa",
      },
      {
        amount: "18000.00",
        category: "SALARIES",
        description: "Helper Salary",
      },
      {
        amount: "3500.00",
        category: "MARKETING",
        description: "Pamphlet Print",
      },
      { amount: "800.00", category: "OTHER", description: "Transport" },
    ]);

    console.log("✓ Added expenses");

    const user = createdUser.user;

    /**
     * Helper function to create transaction with automatic calculations
     * Ensures data integrity and prevents calculation errors
     */
    async function createTransaction(
      items: Array<{ productIndex: number; quantity: number }>,
      paymentMethod: "CASH" | "CARD" | "EASYPAISA",
      status: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED" = "COMPLETED",
    ) {
      let totalAmount = 0;
      let totalProfit = 0;

      const transactionItemsData = items.map((item) => {
        const product = createdProducts[item.productIndex];
        const price = parseFloat(product!.price);
        const cost = parseFloat(product!.cost);

        totalAmount += price * item.quantity;
        totalProfit += (price - cost) * item.quantity;

        return {
          product,
          quantity: item.quantity,
          unitPrice: product!.price,
        };
      });

      const [transaction] = await db
        .insert(schema.transactions)
        .values({
          userId: user.id,
          totalAmount: totalAmount.toFixed(2),
          grossProfit: totalProfit.toFixed(2),
          paymentMethod,
          status,
        })
        .returning({ id: schema.transactions.id });

      if (!transaction) throw new Error("Transaction creation failed");

      await db.insert(schema.transactionItems).values(
        transactionItemsData.map((item) => ({
          transactionId: transaction.id,
          productId: item.product!.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      );

      return {
        totalAmount: totalAmount.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
      };
    }

    // Create realistic transaction mix (20 transactions)
    const transactions = [];

    // Transaction 1: Morning customer - Tea, Milk, Bread
    transactions.push(
      await createTransaction(
        [
          { productIndex: 0, quantity: 1 }, // Tapal 1450
          { productIndex: 2, quantity: 2 }, // Olpers milk x2
          { productIndex: 8, quantity: 1 }, // Bread
        ],
        "CASH",
      ),
    );

    // Transaction 2: Bulk grocery - Rice, Oil, Atta
    transactions.push(
      await createTransaction(
        [
          { productIndex: 14, quantity: 2 }, // Basmati 5kg x2
          { productIndex: 7, quantity: 2 }, // Dalda oil x2
          { productIndex: 22, quantity: 1 }, // Atta 10kg
          { productIndex: 4, quantity: 2 }, // Shan biryani x2
        ],
        "EASYPAISA",
      ),
    );

    // Transaction 3: Cleaning day
    transactions.push(
      await createTransaction(
        [
          { productIndex: 10, quantity: 2 }, // Surf excel x2
          { productIndex: 12, quantity: 2 }, // Harpic x2
          { productIndex: 13, quantity: 4 }, // Vim x4
        ],
        "CARD",
      ),
    );

    // Transaction 4: Daily essentials
    transactions.push(
      await createTransaction(
        [
          { productIndex: 3, quantity: 4 }, // Nestle milk x4
          { productIndex: 8, quantity: 3 }, // Bread x3
          { productIndex: 23, quantity: 2 }, // Sugar x2
        ],
        "CASH",
      ),
    );

    // Transaction 5: Snack time
    transactions.push(
      await createTransaction(
        [
          { productIndex: 17, quantity: 5 }, // Kolson x5
          { productIndex: 18, quantity: 5 }, // Lays x5
          { productIndex: 16, quantity: 2 }, // Peek freans x2
        ],
        "CASH",
      ),
    );

    // Transaction 6: Weekly shopping
    transactions.push(
      await createTransaction(
        [
          { productIndex: 15, quantity: 1 }, // Sella rice
          { productIndex: 7, quantity: 1 }, // Oil
          { productIndex: 2, quantity: 6 }, // Milk x6
          { productIndex: 4, quantity: 3 }, // Shan biryani x3
          { productIndex: 9, quantity: 2 }, // Rusk x2
        ],
        "CARD",
      ),
    );

    // Transaction 7: Personal care
    transactions.push(
      await createTransaction(
        [
          { productIndex: 19, quantity: 3 }, // Lux soap x3
          { productIndex: 20, quantity: 4 }, // Lifebuoy x4
          { productIndex: 21, quantity: 2 }, // Closeup x2
        ],
        "EASYPAISA",
      ),
    );

    // Transaction 8: Tea bulk buy
    transactions.push(
      await createTransaction(
        [
          { productIndex: 1, quantity: 3 }, // Lipton x3
          { productIndex: 0, quantity: 2 }, // Tapal x2
        ],
        "CARD",
      ),
    );

    // Transaction 9: Monthly stock
    transactions.push(
      await createTransaction(
        [
          { productIndex: 22, quantity: 2 }, // Atta x2
          { productIndex: 23, quantity: 5 }, // Sugar x5
          { productIndex: 6, quantity: 3 }, // Salt x3
        ],
        "CASH",
      ),
    );

    // Transaction 10: Mixed shopping
    transactions.push(
      await createTransaction(
        [
          { productIndex: 14, quantity: 1 }, // Basmati rice
          { productIndex: 11, quantity: 2 }, // Ariel x2
          { productIndex: 16, quantity: 3 }, // Peek freans x3
        ],
        "EASYPAISA",
      ),
    );

    // Transaction 11: Small purchase
    transactions.push(
      await createTransaction(
        [
          { productIndex: 8, quantity: 2 }, // Bread x2
          { productIndex: 2, quantity: 1 }, // Milk
        ],
        "CASH",
      ),
    );

    // Transaction 12: Party supplies
    transactions.push(
      await createTransaction(
        [
          { productIndex: 15, quantity: 3 }, // Sella rice x3
          { productIndex: 3, quantity: 12 }, // Milk x12
          { productIndex: 18, quantity: 10 }, // Lays x10
          { productIndex: 5, quantity: 4 }, // Shan nihari x4
        ],
        "CARD",
      ),
    );

    // Transaction 13: Detergent bulk
    transactions.push(
      await createTransaction(
        [
          { productIndex: 10, quantity: 4 }, // Surf x4
          { productIndex: 11, quantity: 3 }, // Ariel x3
        ],
        "CARD",
      ),
    );

    // Transaction 14: Daily needs
    transactions.push(
      await createTransaction(
        [
          { productIndex: 2, quantity: 3 }, // Milk x3
          { productIndex: 8, quantity: 2 }, // Bread x2
          { productIndex: 17, quantity: 2 }, // Kolson x2
        ],
        "CASH",
      ),
    );

    // Transaction 15: Cooking essentials
    transactions.push(
      await createTransaction(
        [
          { productIndex: 7, quantity: 3 }, // Oil x3
          { productIndex: 4, quantity: 4 }, // Biryani masala x4
          { productIndex: 5, quantity: 3 }, // Nihari masala x3
          { productIndex: 6, quantity: 2 }, // Salt x2
        ],
        "EASYPAISA",
      ),
    );

    // Transaction 16: Household items
    transactions.push(
      await createTransaction(
        [
          { productIndex: 19, quantity: 2 }, // Lux x2
          { productIndex: 12, quantity: 3 }, // Harpic x3
          { productIndex: 13, quantity: 5 }, // Vim x5
        ],
        "CASH",
      ),
    );

    // Transaction 17: Large grocery run
    transactions.push(
      await createTransaction(
        [
          { productIndex: 14, quantity: 3 }, // Basmati x3
          { productIndex: 22, quantity: 2 }, // Atta x2
          { productIndex: 7, quantity: 2 }, // Oil x2
          { productIndex: 23, quantity: 4 }, // Sugar x4
          { productIndex: 2, quantity: 8 }, // Milk x8
        ],
        "CARD",
      ),
    );

    // Transaction 18: Quick stop
    transactions.push(
      await createTransaction(
        [
          { productIndex: 18, quantity: 3 }, // Lays x3
          { productIndex: 3, quantity: 2 }, // Milk x2
        ],
        "CASH",
      ),
    );

    // Transaction 19: Weekend shopping
    transactions.push(
      await createTransaction(
        [
          { productIndex: 15, quantity: 2 }, // Sella rice x2
          { productIndex: 10, quantity: 1 }, // Surf excel
          { productIndex: 21, quantity: 3 }, // Closeup x3
          { productIndex: 9, quantity: 3 }, // Rusk x3
        ],
        "EASYPAISA",
      ),
    );

    // Transaction 20: Mixed items
    transactions.push(
      await createTransaction(
        [
          { productIndex: 0, quantity: 1 }, // Tapal
          { productIndex: 11, quantity: 2 }, // Ariel x2
          { productIndex: 16, quantity: 4 }, // Peek freans x4
          { productIndex: 20, quantity: 3 }, // Lifebuoy x3
        ],
        "CARD",
      ),
    );

    console.log(`✓ Created ${transactions.length} transactions`);

    // Calculate and display summary
    const totalRevenue = transactions.reduce(
      (sum, t) => sum + parseFloat(t.totalAmount),
      0,
    );
    const totalGrossProfit = transactions.reduce(
      (sum, t) => sum + parseFloat(t.totalProfit),
      0,
    );
    const totalExpenses = 115000; // Sum of all expenses

    console.log("\nSeeding Summary:");
    console.log("==================");
    console.log(`Total Revenue:      Rs. ${totalRevenue.toFixed(2)}`);
    console.log(`Total Gross Profit: Rs. ${totalGrossProfit.toFixed(2)}`);
    console.log(`Total Expenses:     Rs. ${totalExpenses.toFixed(2)}`);
    console.log(
      `Net Profit:         Rs. ${(totalGrossProfit - totalExpenses).toFixed(2)}`,
    );
    console.log(
      `Profit Margin:      ${((totalGrossProfit / totalRevenue) * 100).toFixed(2)}%`,
    );
    console.log("\nDatabase seeded successfully with realistic data!");
  } catch (error) {
    console.error("Failed to seed database:", error);
    throw error;
  }
}

// Execute seed
seedDatabase()
  .then(() => {
    console.log("\nSeed process completed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\nSeed process failed:", err);
    process.exit(1);
  });
