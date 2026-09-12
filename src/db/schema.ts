import { pgTable, text, varchar, vector, index } from "drizzle-orm/pg-core";

export const documents = pgTable(
  "documents",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 384 }), // all-MiniLM-L6-v2 has 384 dimensions
  },
  (table) => ({
    embeddingIndex: index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);
