import { MongoClient } from 'mongodb';

async function migrateData() {
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Find the krish user
    const krishUser = await db.collection('users').findOne({ username: 'krish' });
    console.log('Krish user:', krishUser);
    
    if (!krishUser) {
      console.log('Krish user not found, creating...');
      const newUser = {
        id: 1,
        username: 'krish',
        password: '$2a$10$7VZvGKQX0kB9TK/L.xQjwe0F7w7L8jQ6eN5K.4GQ8nF.gB8XlL8UC', // krish123
        type: 'user'
      };
      await db.collection('users').insertOne(newUser);
      console.log('Created krish user');
    }
    
    const userId = krishUser?.id || 1;
    console.log('Using userId:', userId);
    
    // Check existing data counts
    const itemsCount = await db.collection('items').countDocuments({});
    const unitsCount = await db.collection('units').countDocuments({});
    const customersCount = await db.collection('customers').countDocuments({});
    const servicesCount = await db.collection('services').countDocuments({});
    
    console.log('Data counts:');
    console.log('- Items:', itemsCount);
    console.log('- Units:', unitsCount);
    console.log('- Customers:', customersCount);
    console.log('- Services:', servicesCount);
    
    // Update items without userId to belong to krish
    const itemsResult = await db.collection('items').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: userId } }
    );
    console.log('Updated items:', itemsResult.modifiedCount);
    
    // Update units without userId to belong to krish
    const unitsResult = await db.collection('units').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: userId } }
    );
    console.log('Updated units:', unitsResult.modifiedCount);
    
    // Update customers without userId to belong to krish
    const customersResult = await db.collection('customers').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: userId } }
    );
    console.log('Updated customers:', customersResult.modifiedCount);
    
    // Update services without userId to belong to krish
    const servicesResult = await db.collection('services').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: userId } }
    );
    console.log('Updated services:', servicesResult.modifiedCount);
    
    // Update categories without userId to belong to krish
    const categoriesResult = await db.collection('categories').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: userId } }
    );
    console.log('Updated categories:', categoriesResult.modifiedCount);
    
    // Update service items without userId to belong to krish
    const serviceItemsResult = await db.collection('serviceItems').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: userId } }
    );
    console.log('Updated service items:', serviceItemsResult.modifiedCount);
    
    // Update rentals without userId to belong to krish
    const rentalsResult = await db.collection('rentals').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: userId } }
    );
    console.log('Updated rentals:', rentalsResult.modifiedCount);
    
    // Update rental timeline without userId to belong to krish
    const timelineResult = await db.collection('rentalTimeline').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: userId } }
    );
    console.log('Updated rental timeline:', timelineResult.modifiedCount);
    
    // Update vendors without userId to belong to krish  
    const vendorsResult = await db.collection('vendors').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: userId } }
    );
    console.log('Updated vendors:', vendorsResult.modifiedCount);
    
    // Update purchase orders without userId to belong to krish
    const purchaseOrdersResult = await db.collection('purchaseOrders').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: userId } }
    );
    console.log('Updated purchase orders:', purchaseOrdersResult.modifiedCount);
    
    // Update sell orders without userId to belong to krish
    const sellOrdersResult = await db.collection('sellOrders').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: userId } }
    );
    console.log('Updated sell orders:', sellOrdersResult.modifiedCount);
    
    console.log('Data migration completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await client.close();
  }
}

migrateData();