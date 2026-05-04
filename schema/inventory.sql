DROP TABLE IF EXISTS inventory CASCADE;

CREATE TABLE inventory (
    product_id INT,
    warehouse_id INT,
    quantity INT NOT NULL CHECK (quantity >= 0),

    PRIMARY KEY (product_id, warehouse_id),

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,

    FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(warehouse_id)
        ON DELETE CASCADE
);

