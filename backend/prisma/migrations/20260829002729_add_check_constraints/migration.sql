ALTER TABLE "order_items" ADD CONSTRAINT "quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "services" ADD CONSTRAINT "price_positive" CHECK ("price" > 0);
ALTER TABLE "order_items" ADD CONSTRAINT "unit_price_positive" CHECK ("unit_price" > 0);
ALTER TABLE "orders" ADD CONSTRAINT "total_price_non_negative" CHECK ("total_price" >= 0);