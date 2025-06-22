import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import engine
from app.models import user, product, cart, order  # Import all models to ensure they're loaded

def update_database_schema():
    """Add missing columns to existing tables"""
    
    with engine.connect() as conn:
        # Check and add missing columns to products table
        try:
            # Check if image column exists
            result = conn.execute(text("PRAGMA table_info(products)"))
            columns = [row[1] for row in result]
            
            if 'image' not in columns:
                print("Adding 'image' column to products table...")
                conn.execute(text("ALTER TABLE products ADD COLUMN image VARCHAR(500)"))
                conn.commit()
                print("✓ Added 'image' column")
            
            if 'is_featured' not in columns:
                print("Adding 'is_featured' column to products table...")
                conn.execute(text("ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT 0"))
                conn.commit()
                print("✓ Added 'is_featured' column")
                
            if 'updated_at' not in columns:
                print("Adding 'updated_at' column to products table...")
                conn.execute(text("ALTER TABLE products ADD COLUMN updated_at DATETIME"))
                conn.commit()
                print("✓ Added 'updated_at' column")
                
            # Check categories table
            result = conn.execute(text("PRAGMA table_info(categories)"))
            cat_columns = [row[1] for row in result]
            
            if not any('categories' in str(row[0]) for row in conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))):
                print("\nCreating categories table...")
                conn.execute(text("""
                    CREATE TABLE categories (
                        id INTEGER PRIMARY KEY,
                        name VARCHAR(100) UNIQUE NOT NULL,
                        description TEXT,
                        is_active BOOLEAN DEFAULT 1,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME
                    )
                """))
                conn.commit()
                print("✓ Created categories table")
                
                # Add some default categories
                conn.execute(text("""
                    INSERT INTO categories (name, description) VALUES 
                    ('Electronics', 'Electronic devices and accessories'),
                    ('Clothing', 'Fashion and apparel'),
                    ('Books', 'Books and educational materials'),
                    ('Home & Garden', 'Home improvement and garden supplies')
                """))
                conn.commit()
                print("✓ Added default categories")
            
            # Check reviews table
            if not any('reviews' in str(row[0]) for row in conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))):
                print("\nCreating reviews table...")
                conn.execute(text("""
                    CREATE TABLE reviews (
                        id INTEGER PRIMARY KEY,
                        rating INTEGER NOT NULL,
                        comment TEXT,
                        user_id INTEGER NOT NULL,
                        product_id INTEGER NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id),
                        FOREIGN KEY (product_id) REFERENCES products(id)
                    )
                """))
                conn.commit()
                print("✓ Created reviews table")
            
            print("\n✓ Database schema updated successfully!")
            
        except Exception as e:
            print(f"\n✗ Error updating database: {e}")
            raise

if __name__ == "__main__":
    print("=== Database Update Script ===")
    update_database_schema()