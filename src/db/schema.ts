import { pgTable, text, varchar, vector, index } from "drizzle-orm/pg-core";

export const documents = pgTable(
  "documents",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 3072 }), // gemini-embedding-001 has 3072 dimensions
  },
  (table) => ({
    embeddingIndex: index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);
