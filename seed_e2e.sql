-- Seed script for E2E order creation test
-- Target: PostgreSQL 18, database: clone

-- 1. Create a company if not exists (needed by branches FK)
INSERT INTO companies (id, name, is_active)
SELECT 'rest-1', 'Burger House Ltda', true
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE id = 'rest-1');

-- 2. Create a branch for Burger House (id matches restaurant id as per codebase convention)
INSERT INTO branches (id, company_id, name, address, number, neighborhood, city, state, delivery_radius_km)
SELECT 'rest-1', 'rest-1', 'Burger House Centro', 'Rua Major Claudiano, 1234', '1234', 'Centro', 'Franca', 'SP', 8
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE id = 'rest-1');

-- 3. Insert 2 menu items for restaurant 'rest-1'
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, is_available)
SELECT 'item-burger-classic', 'rest-1', 'Classic Burger', 'Hambúrguer artesanal com queijo cheddar, alface e tomate', 29.90, 'hamburgueres', true
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE id = 'item-burger-classic');

INSERT INTO menu_items (id, restaurant_id, name, description, price, category, is_available)
SELECT 'item-burger-bacon', 'rest-1', 'Bacon Burger', 'Hambúrguer artesanal com bacon crocante e cheddar', 34.90, 'hamburgueres', true
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE id = 'item-burger-bacon');

-- 4. Insert an address for the test user
INSERT INTO addresses (id, user_id, label, street, number, neighborhood, city, state, zip_code, is_default)
SELECT 'addr-teste-1', '6dcb28ec-6517-4536-b59e-c998cd3be182', 'Casa', 'Rua Teste', '100', 'Centro', 'Franca', 'SP', '14400000', true
WHERE NOT EXISTS (SELECT 1 FROM addresses WHERE id = 'addr-teste-1');
