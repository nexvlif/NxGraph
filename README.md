# NxGraph

NxGraph is a premium, open-source database schema designer built for modern developers. It combines the speed of plain-text DBML editing with the visual clarity of an interactive, node-based canvas.

With a sleek "Next.js Black" aesthetic, NxGraph acts as the ultimate tool for planning, visualizing, and exporting your SQL architectures.

## Features

*   **Realtime DBML Parser:** Type your schema in a familiar `Table` format; watch the canvas build itself instantly. No more tedious manual node dragging for complex databases.
*   **Premium Interactive Editor:** Integrated with **Monaco Editor** for syntax highlighting, error boundaries, and auto-formatting.
*   **Smart Auto-Layout:** Powered by `dagre`, your tables are mathematically arranged to prevent overlapping, even when importing massive schemas.
*   **Interactive Visualizer:** Powered by React Flow. Drag nodes, zoom, pan, and visually track 1:1, 1:N, and N:M relationships with smooth Bezier curves.
*   **Canvas Search:** Instantly find tables or columns in massive schemas. Unmatched nodes gracefully fade out.
*   **Realtime Properties Inspector:** Click on any table or relation line to see detailed metadata, primary/foreign keys, and data types cleanly laid out.
*   **SQL Generation:** One-click export your visual schema directly into valid PostgreSQL/MySQL statements.
*   **Zero Distractions:** Pure read-only canvas. The code is your single source of truth.

## Quick Start

### Prerequisites
*   Node.js 18.x or higher
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/nexvlif/NxGraph.git
    cd nxgraph
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser to start diagramming.

## Usage (DBML Syntax)

NxGraph uses a lightweight version of DBML as the source of truth. Type this directly into the left panel:

```dbml
Table users {
  id uuid [primary key]
  username varchar(100)
  email varchar [unique]
  created_at timestamp
}

Table posts {
  id uuid [primary key]
  author_id uuid [ref: > users.id]
  title varchar(255)
  content text
}

Table profile {
  id uuid [primary key]
  user_id uuid [unique, ref: - users.id]
  bio text
}
```

*   `[primary key]` or `[pk]` marks a column as a Primary Key.
*   `[unique]` marks a column as Unique.
*   `[not null]` enforces null checks.
*   `[ref: > table.col]` creates a One-to-Many relationship.
*   `[ref: - table.col]` creates a One-to-One relationship.

## Tech Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Visualizer:** `@xyflow/react` (React Flow)
*   **State Management:** Zustand
*   **Editor:** `@monaco-editor/react`
*   **Layout Engine:** `dagre`
*   **Styling:** Custom CSS with Next.js Black UI constraints

## Contributing

Contributions are welcome! If you have ideas for new features, better parser support, or UI improvements, please open an issue or submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.