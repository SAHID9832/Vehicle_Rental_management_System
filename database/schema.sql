-- ============================================================
--  Vektor Rentals – Vehicle Rental Management System
--  FILE   : schema.sql
--  PURPOSE: Database schema definition
--  ENGINE : MySQL 8.0+
--  CHARSET: utf8mb4
-- ============================================================

DROP DATABASE IF EXISTS vektor_rentals;
CREATE DATABASE vektor_rentals
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE vektor_rentals;

-- ──────────────────────────────────────────────
-- SET SESSION SETTINGS
-- ──────────────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- ==============================================================
-- TABLE 1 : roles
-- ==============================================================
CREATE TABLE roles (
    id          INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    name        VARCHAR(50)     NOT NULL,
    description VARCHAR(255)    NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uq_roles_name UNIQUE (name)
) ENGINE=InnoDB;

-- ==============================================================
-- TABLE 2 : users
-- ==============================================================
CREATE TABLE users (
    id            INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    email         VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id       INT          UNSIGNED NOT NULL,
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login    DATETIME     NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id)
        REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_users_role_id  ON users (role_id);
CREATE INDEX idx_users_is_active ON users (is_active);

-- ==============================================================
-- TABLE 3 : customers
-- ==============================================================
CREATE TABLE customers (
    id               INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id          INT          UNSIGNED NOT NULL,
    first_name       VARCHAR(80)  NOT NULL,
    last_name        VARCHAR(80)  NOT NULL,
    phone            VARCHAR(15)  NOT NULL,
    address          VARCHAR(255) NOT NULL,
    city             VARCHAR(80)  NOT NULL DEFAULT 'Bengaluru',
    state            VARCHAR(80)  NOT NULL DEFAULT 'Karnataka',
    pincode          VARCHAR(10)  NOT NULL,
    driving_license  VARCHAR(30)  NOT NULL,
    date_of_birth    DATE         NOT NULL,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_customers PRIMARY KEY (id),
    CONSTRAINT uq_customers_user_id UNIQUE (user_id),
    CONSTRAINT uq_customers_driving_license UNIQUE (driving_license),
    CONSTRAINT fk_customers_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_customers_phone ON customers (phone);

-- ==============================================================
-- TABLE 4 : vehicle_categories
-- ==============================================================
CREATE TABLE vehicle_categories (
    id          INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    name        VARCHAR(80)  NOT NULL,
    description VARCHAR(255) NULL,
    icon_name   VARCHAR(80)  NULL,
    is_active   TINYINT(1)   NOT NULL DEFAULT 1,
    CONSTRAINT pk_vehicle_categories PRIMARY KEY (id),
    CONSTRAINT uq_vehicle_categories_name UNIQUE (name)
) ENGINE=InnoDB;

-- ==============================================================
-- TABLE 5 : branches
-- ==============================================================
CREATE TABLE branches (
    id           INT            UNSIGNED NOT NULL AUTO_INCREMENT,
    name         VARCHAR(120)   NOT NULL,
    address      VARCHAR(255)   NOT NULL,
    city         VARCHAR(80)    NOT NULL DEFAULT 'Bengaluru',
    state        VARCHAR(80)    NOT NULL DEFAULT 'Karnataka',
    pincode      VARCHAR(10)    NOT NULL,
    phone        VARCHAR(50)    NOT NULL,
    email        VARCHAR(150)   NOT NULL,
    manager_name VARCHAR(120)   NOT NULL,
    latitude     DECIMAL(10,7)  NOT NULL,
    longitude    DECIMAL(10,7)  NOT NULL,
    is_active    TINYINT(1)     NOT NULL DEFAULT 1,
    created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_branches PRIMARY KEY (id),
    CONSTRAINT uq_branches_email UNIQUE (email)
) ENGINE=InnoDB;

-- ==============================================================
-- TABLE 6 : branch_connections  (Graph adjacency list for DSA)
-- ==============================================================
CREATE TABLE branch_connections (
    id               INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    from_branch_id   INT          UNSIGNED NOT NULL,
    to_branch_id     INT          UNSIGNED NOT NULL,
    distance_km      DECIMAL(6,2) NOT NULL,
    travel_time_mins INT          UNSIGNED NOT NULL,
    is_active        TINYINT(1)   NOT NULL DEFAULT 1,
    CONSTRAINT pk_branch_connections PRIMARY KEY (id),
    CONSTRAINT uq_branch_connection UNIQUE (from_branch_id, to_branch_id),
    CONSTRAINT fk_bc_from FOREIGN KEY (from_branch_id)
        REFERENCES branches(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bc_to   FOREIGN KEY (to_branch_id)
        REFERENCES branches(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_bc_from ON branch_connections (from_branch_id);
CREATE INDEX idx_bc_to   ON branch_connections (to_branch_id);

-- ==============================================================
-- TABLE 7 : vehicles
-- ==============================================================
CREATE TABLE vehicles (
    id                INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    vehicle_id        VARCHAR(20)     NOT NULL,
    name              VARCHAR(120)    NOT NULL,
    model             VARCHAR(80)     NOT NULL,
    brand             VARCHAR(80)     NOT NULL,
    year              YEAR            NOT NULL,
    category_id       INT             UNSIGNED NOT NULL,
    branch_id         INT             UNSIGNED NOT NULL,
    color             VARCHAR(40)     NOT NULL,
    fuel_type         ENUM('Petrol','Diesel','Electric','CNG','Hybrid') NOT NULL,
    transmission      ENUM('Manual','Automatic') NOT NULL,
    seating_capacity  TINYINT         UNSIGNED NOT NULL,
    daily_rate        DECIMAL(10,2)   NOT NULL,
    weekly_rate       DECIMAL(10,2)   NOT NULL,
    monthly_rate      DECIMAL(10,2)   NOT NULL,
    security_deposit  DECIMAL(10,2)   NOT NULL,
    image_url         VARCHAR(255)    NULL,
    description       TEXT            NULL,
    features          JSON            NULL,
    status            ENUM('Available','Rented','Reserved','Maintenance','Inactive')
                                      NOT NULL DEFAULT 'Available',
    mileage           DECIMAL(5,2)    NULL COMMENT 'km per litre / km per charge',
    engine_cc         INT             UNSIGNED NULL,
    created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_vehicles PRIMARY KEY (id),
    CONSTRAINT uq_vehicles_vehicle_id UNIQUE (vehicle_id),
    CONSTRAINT fk_vehicles_category FOREIGN KEY (category_id)
        REFERENCES vehicle_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_vehicles_branch   FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_daily_rate      CHECK (daily_rate > 0),
    CONSTRAINT chk_weekly_rate     CHECK (weekly_rate > 0),
    CONSTRAINT chk_monthly_rate    CHECK (monthly_rate > 0),
    CONSTRAINT chk_security_deposit CHECK (security_deposit >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_vehicles_category_id ON vehicles (category_id);
CREATE INDEX idx_vehicles_branch_id   ON vehicles (branch_id);
CREATE INDEX idx_vehicles_status      ON vehicles (status);
CREATE INDEX idx_vehicles_fuel_type   ON vehicles (fuel_type);

-- ==============================================================
-- TABLE 8 : bookings
-- ==============================================================
CREATE TABLE bookings (
    id                  INT            UNSIGNED NOT NULL AUTO_INCREMENT,
    booking_reference   VARCHAR(20)    NOT NULL,
    customer_id         INT            UNSIGNED NOT NULL,
    vehicle_id          INT            UNSIGNED NOT NULL,
    pickup_branch_id    INT            UNSIGNED NOT NULL,
    return_branch_id    INT            UNSIGNED NOT NULL,
    pickup_datetime     DATETIME       NOT NULL,
    return_datetime     DATETIME       NOT NULL,
    actual_return_datetime DATETIME    NULL,
    status              ENUM('Pending','Confirmed','Active','Completed','Cancelled')
                                       NOT NULL DEFAULT 'Pending',
    total_days          SMALLINT       UNSIGNED NOT NULL,
    subtotal            DECIMAL(12,2)  NOT NULL,
    discount            DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    additional_charges  DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    total_amount        DECIMAL(12,2)  NOT NULL,
    notes               TEXT           NULL,
    created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_bookings PRIMARY KEY (id),
    CONSTRAINT uq_bookings_reference UNIQUE (booking_reference),
    CONSTRAINT fk_bookings_customer       FOREIGN KEY (customer_id)
        REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_vehicle        FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_pickup_branch  FOREIGN KEY (pickup_branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_return_branch  FOREIGN KEY (return_branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_booking_dates CHECK (return_datetime > pickup_datetime),
    CONSTRAINT chk_booking_total_days CHECK (total_days > 0),
    CONSTRAINT chk_booking_subtotal      CHECK (subtotal >= 0),
    CONSTRAINT chk_booking_total_amount  CHECK (total_amount >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_bookings_customer_id       ON bookings (customer_id);
CREATE INDEX idx_bookings_vehicle_id        ON bookings (vehicle_id);
CREATE INDEX idx_bookings_status            ON bookings (status);
CREATE INDEX idx_bookings_pickup_datetime   ON bookings (pickup_datetime);
CREATE INDEX idx_bookings_return_datetime   ON bookings (return_datetime);
CREATE INDEX idx_bookings_pickup_branch_id  ON bookings (pickup_branch_id);
CREATE INDEX idx_bookings_return_branch_id  ON bookings (return_branch_id);

-- ==============================================================
-- TRIGGER: before_booking_insert
-- Prevents overlapping bookings for the same vehicle
-- ==============================================================
DELIMITER $$

CREATE TRIGGER before_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT DEFAULT 0;

    SELECT COUNT(*) INTO conflict_count
    FROM bookings
    WHERE vehicle_id = NEW.vehicle_id
      AND status NOT IN ('Cancelled')
      AND (
          (NEW.pickup_datetime  < return_datetime  AND NEW.return_datetime  > pickup_datetime)
      );

    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Booking conflict: vehicle already booked for the requested time range.';
    END IF;
END$$

-- ==============================================================
-- TRIGGER: before_booking_update
-- Prevents overlapping bookings when updating dates/vehicle
-- ==============================================================
CREATE TRIGGER before_booking_update
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT DEFAULT 0;

    IF (NEW.pickup_datetime != OLD.pickup_datetime
        OR NEW.return_datetime != OLD.return_datetime
        OR NEW.vehicle_id != OLD.vehicle_id)
       AND NEW.status NOT IN ('Cancelled') THEN

        SELECT COUNT(*) INTO conflict_count
        FROM bookings
        WHERE vehicle_id = NEW.vehicle_id
          AND id != NEW.id
          AND status NOT IN ('Cancelled')
          AND (
              (NEW.pickup_datetime < return_datetime AND NEW.return_datetime > pickup_datetime)
          );

        IF conflict_count > 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Booking update conflict: vehicle already booked for the requested time range.';
        END IF;
    END IF;
END$$

DELIMITER ;

-- ==============================================================
-- TABLE 9 : rentals
-- ==============================================================
CREATE TABLE rentals (
    id                      INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    booking_id              INT          UNSIGNED NOT NULL,
    vehicle_id              INT          UNSIGNED NOT NULL,
    customer_id             INT          UNSIGNED NOT NULL,
    pickup_datetime         DATETIME     NOT NULL,
    expected_return_datetime DATETIME   NOT NULL,
    actual_return_datetime  DATETIME     NULL,
    status                  ENUM('Active','Completed','Overdue') NOT NULL DEFAULT 'Active',
    odometer_start          INT          UNSIGNED NOT NULL DEFAULT 0,
    odometer_end            INT          UNSIGNED NULL,
    condition_on_pickup     TEXT         NULL,
    condition_on_return     TEXT         NULL,
    created_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_rentals PRIMARY KEY (id),
    CONSTRAINT uq_rentals_booking_id UNIQUE (booking_id),
    CONSTRAINT fk_rentals_booking  FOREIGN KEY (booking_id)
        REFERENCES bookings(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rentals_vehicle  FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rentals_customer FOREIGN KEY (customer_id)
        REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_rentals_vehicle_id  ON rentals (vehicle_id);
CREATE INDEX idx_rentals_customer_id ON rentals (customer_id);
CREATE INDEX idx_rentals_status      ON rentals (status);

-- ==============================================================
-- TABLE 10 : rental_history
-- ==============================================================
CREATE TABLE rental_history (
    id              INT           UNSIGNED NOT NULL AUTO_INCREMENT,
    booking_id      INT           UNSIGNED NOT NULL,
    vehicle_id      INT           UNSIGNED NOT NULL,
    customer_id     INT           UNSIGNED NOT NULL,
    pickup_datetime DATETIME      NOT NULL,
    return_datetime DATETIME      NOT NULL,
    total_days      SMALLINT      UNSIGNED NOT NULL,
    total_amount    DECIMAL(12,2) NOT NULL,
    status          VARCHAR(40)   NOT NULL,
    notes           TEXT          NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_rental_history PRIMARY KEY (id),
    CONSTRAINT fk_rh_booking  FOREIGN KEY (booking_id)
        REFERENCES bookings(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rh_vehicle  FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rh_customer FOREIGN KEY (customer_id)
        REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_rh_booking_id  ON rental_history (booking_id);
CREATE INDEX idx_rh_vehicle_id  ON rental_history (vehicle_id);
CREATE INDEX idx_rh_customer_id ON rental_history (customer_id);
CREATE INDEX idx_rh_status      ON rental_history (status);

-- ==============================================================
-- TABLE 11 : waiting_queue
-- ==============================================================
CREATE TABLE waiting_queue (
    id                  INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id         INT          UNSIGNED NOT NULL,
    vehicle_category_id INT          UNSIGNED NOT NULL,
    branch_id           INT          UNSIGNED NOT NULL,
    requested_from      DATETIME     NOT NULL,
    requested_to        DATETIME     NOT NULL,
    priority            TINYINT      UNSIGNED NOT NULL DEFAULT 5
                                     COMMENT '1=Highest, 10=Lowest',
    status              ENUM('Waiting','Notified','Fulfilled','Cancelled')
                                     NOT NULL DEFAULT 'Waiting',
    enqueued_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fulfilled_at        DATETIME     NULL,
    CONSTRAINT pk_waiting_queue PRIMARY KEY (id),
    CONSTRAINT fk_wq_customer  FOREIGN KEY (customer_id)
        REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_wq_category  FOREIGN KEY (vehicle_category_id)
        REFERENCES vehicle_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_wq_branch    FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_wq_dates CHECK (requested_to > requested_from),
    CONSTRAINT chk_wq_priority CHECK (priority BETWEEN 1 AND 10)
) ENGINE=InnoDB;

CREATE INDEX idx_wq_customer_id  ON waiting_queue (customer_id);
CREATE INDEX idx_wq_category_id  ON waiting_queue (vehicle_category_id);
CREATE INDEX idx_wq_branch_id    ON waiting_queue (branch_id);
CREATE INDEX idx_wq_status       ON waiting_queue (status);
CREATE INDEX idx_wq_priority     ON waiting_queue (priority);

-- ==============================================================
-- TABLE 12 : maintenance_records
-- ==============================================================
CREATE TABLE maintenance_records (
    id               INT           UNSIGNED NOT NULL AUTO_INCREMENT,
    vehicle_id       INT           UNSIGNED NOT NULL,
    maintenance_type VARCHAR(80)   NOT NULL,
    description      TEXT          NOT NULL,
    cost             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    scheduled_date   DATE          NOT NULL,
    completed_date   DATE          NULL,
    performed_by     VARCHAR(120)  NULL,
    branch_id        INT           UNSIGNED NOT NULL,
    status           ENUM('Scheduled','InProgress','Completed','Cancelled')
                                   NOT NULL DEFAULT 'Scheduled',
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_maintenance_records PRIMARY KEY (id),
    CONSTRAINT fk_mr_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_mr_branch  FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_mr_cost CHECK (cost >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_mr_vehicle_id ON maintenance_records (vehicle_id);
CREATE INDEX idx_mr_branch_id  ON maintenance_records (branch_id);
CREATE INDEX idx_mr_status     ON maintenance_records (status);

-- ==============================================================
-- TABLE 13 : invoices
-- ==============================================================
CREATE TABLE invoices (
    id                 INT           UNSIGNED NOT NULL AUTO_INCREMENT,
    invoice_number     VARCHAR(20)   NOT NULL,
    booking_id         INT           UNSIGNED NOT NULL,
    customer_id        INT           UNSIGNED NOT NULL,
    subtotal           DECIMAL(12,2) NOT NULL,
    discount           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    additional_charges DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount       DECIMAL(12,2) NOT NULL,
    payment_status     ENUM('Pending','Paid','Partially Paid','Refunded')
                                     NOT NULL DEFAULT 'Pending',
    issued_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date           DATETIME      NOT NULL,
    paid_at            DATETIME      NULL,
    CONSTRAINT pk_invoices PRIMARY KEY (id),
    CONSTRAINT uq_invoices_number    UNIQUE (invoice_number),
    CONSTRAINT uq_invoices_booking   UNIQUE (booking_id),
    CONSTRAINT fk_inv_booking  FOREIGN KEY (booking_id)
        REFERENCES bookings(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_inv_customer FOREIGN KEY (customer_id)
        REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_inv_subtotal CHECK (subtotal >= 0),
    CONSTRAINT chk_inv_total   CHECK (total_amount >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_invoices_customer_id    ON invoices (customer_id);
CREATE INDEX idx_invoices_payment_status ON invoices (payment_status);
CREATE INDEX idx_invoices_due_date       ON invoices (due_date);

-- ==============================================================
-- TABLE 14 : payments
-- ==============================================================
CREATE TABLE payments (
    id             INT           UNSIGNED NOT NULL AUTO_INCREMENT,
    invoice_id     INT           UNSIGNED NOT NULL,
    amount         DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash','Card','UPI','NetBanking','Simulated') NOT NULL,
    transaction_id VARCHAR(100)  NULL,
    status         ENUM('Pending','Success','Failed','Refunded') NOT NULL DEFAULT 'Pending',
    paid_at        DATETIME      NULL,
    notes          TEXT          NULL,
    CONSTRAINT pk_payments PRIMARY KEY (id),
    CONSTRAINT fk_pay_invoice FOREIGN KEY (invoice_id)
        REFERENCES invoices(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_pay_amount CHECK (amount > 0)
) ENGINE=InnoDB;

CREATE INDEX idx_payments_invoice_id ON payments (invoice_id);
CREATE INDEX idx_payments_status     ON payments (status);

-- ==============================================================
-- TABLE 15 : notifications
-- ==============================================================
CREATE TABLE notifications (
    id         INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id    INT          UNSIGNED NOT NULL,
    title      VARCHAR(150) NOT NULL,
    message    TEXT         NOT NULL,
    type       ENUM('Booking','Rental','Payment','System','Maintenance') NOT NULL,
    is_read    BOOLEAN      NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_notifications PRIMARY KEY (id),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_notif_user_id  ON notifications (user_id);
CREATE INDEX idx_notif_is_read  ON notifications (is_read);
CREATE INDEX idx_notif_type     ON notifications (type);

-- ==============================================================
-- RE-ENABLE FK CHECKS
-- ==============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
