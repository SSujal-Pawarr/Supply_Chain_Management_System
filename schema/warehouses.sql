DROP TABLE IF EXISTS warehouses CASCADE;

CREATE TABLE warehouses (
    warehouse_id SERIAL PRIMARY KEY,
    location VARCHAR(150) NOT NULL,
    capacity INT CHECK (capacity >= 0),
    warehouse_manager VARCHAR(100)
);