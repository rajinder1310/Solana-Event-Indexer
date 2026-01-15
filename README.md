# Solana Event Indexer

A robust and scalable TypeScript service designed to index and process transactions from Solana programs in real-time. It uses **@solana/web3.js** for blockchain interaction and **MongoDB** for data persistence.

## 🚀 Features

*   **Historical Indexing**: Fetches transaction signatures for specific Solana programs using `getSignaturesForAddress`
*   **Auto-Resume**: Automatically picks up from the last indexed slot after a restart, ensuring no data is lost
*   **Commitment Level**: Uses `confirmed` commitment to avoid data inconsistencies
*   **Adaptive Batching**: Dynamically adjusts batch sizes based on network performance (coming soon)
*   **Duplicate Prevention**: Handles duplicate transactions gracefully using compound unique indexes
*   **Prefetching**: Optimizes performance by pre-fetching signatures (coming soon)

## 🛠 Prerequisites

Before running this project, ensure you have the following installed:

*   **Node.js** (v18 or higher recommended)
*   **MongoDB** (Local instance or Atlas cluster)

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd Solana-Event-Indexer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Copy the example environment file and configure it:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and set your MongoDB URI:
    ```env
    MONGO_URI=mongodb://localhost:27017/solana_indexer
    # RPC_URL=https://api.devnet.solana.com (Optional default)
    ```

## ⚙️ Configuration

The service is configured via `src/config.ts`. You can add or modify program configurations in the `programs` array.

**Example Program Config:**
```typescript
{
  programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Solana Token Program
  name: 'solana-token-program',
  rpcUrl: 'https://api.devnet.solana.com',
  startSlot: 0,
  maxSignaturesPerRequest: 100
}
```

## ▶️ Usage

### Development Mode
Run the service with hot-reloading (uses `ts-node`):
```bash
npm run dev
```

### Production Build
Build the TypeScript code and run the compiled JavaScript:
```bash
npm run build
npm start
```

## 📂 Project Structure

*   `src/index.ts`: Entry point of the application. Connects to DB and starts the indexer.
*   `src/services/` (coming soon): Core logic for indexing programs
*   `src/config.ts`: Configuration for Solana programs and database
*   `src/models/Transaction.ts`: Mongoose schema for storing indexed transactions
*   `src/types/index.ts`: TypeScript type definitions

## 📊 Database Schema

### Transaction Collection

Each transaction is stored with the following fields:

- `programId`: Solana program address involved in the transaction
- `signature`: Unique transaction signature
- `slot`: Slot number when transaction was processed
- `blockTime`: Unix timestamp of block
- `instructions`: Array of transaction instructions
- `logs`: Transaction logs
- `createdAt`: Timestamp when record was created

**Indexes:**
- Compound unique index on `(programId, signature)` - prevents duplicates
- Compound index on `(programId, slot)` - optimizes resume queries

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
