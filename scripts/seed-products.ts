/**
 * PRODUCT DATABASE SEEDER
 * Populates public.products table with full catalog including Battlefield 6
 * Target: PostgreSQL (Supabase)
 * Database URL: postgresql://postgres:***@db.tcwtqkklmhlucoirnogq.supabase.co:5432/postgres
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Configure pool with SSL options for self-signed certs
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL?.replace('sslmode=require', 'sslmode=disable'),
  ssl: {
    rejectUnauthorized: false
  }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Product data with Battlefield 6 as priority target
const products = [
  // PRIORITY TARGET: Battlefield 6 (Price: 44.45)
  {
    id: 'battlefield-6',
    title: 'Battlefield 6',
    slug: 'battlefield-6',
    price: 44.45, // EXACT PRICE: 44.45
    originalPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=900&auto=format&fit=crop',
    description: 'الجيل الجديد من حرب ساحات المعارك الضخمة. معارك 128 لاعباً، تدمير بيئة متطور، وعالم متغير ديناميكياً.',
    genre: 'Shooter',
    platform: 'PC',
    category: 'game',
    isActive: true,
    isFlashSale: false,
    rating: 4.5,
    reviewsCount: 1250,
    metadata: {
      tags: ['war', 'shooter', 'multiplayer', 'fps'],
      videoUrl: 'cQLakPdVhEc', // YouTube ID: 11 characters
      videoStart: 0,
      videoEnd: 60,
      features: ['128 لاعب', 'تدمير بيئة', 'مركبات حربية', 'خرائط ضخمة'],
      stockStatus: 'IN_STOCK',
      releaseDate: '2024-10-01',
      lastUpdated: {
        by: 'system-seed',
        at: new Date().toISOString()
      }
    }
  },
  
  // Existing catalog (partial - add more as needed)
  {
    id: 'cod-bo6',
    title: 'Call of Duty: Black Ops 6',
    slug: 'bo6',
    price: 24.90,
    originalPrice: 29.90,
    image: '/assets/images/bo6.png',
    description: 'عودة السلسلة الأسطورية مع بلاك أوبس 6. تجربة قتال واقعية، طور قصة سينمائي، وعودة طور الزومبي المحبوب.',
    genre: 'Shooter',
    platform: 'Xbox',
    category: 'game',
    isActive: true,
    isFlashSale: true,
    rating: 4.9,
    reviewsCount: 4200,
    metadata: {
      tags: ['war', 'shooting', 'action'],
      videoUrl: 'Oc_DJm7se3M',
      videoStart: 45,
      videoEnd: 85,
      features: ['طور قصة عميق', 'لعب جماعي تنافسي', 'زومبي الجولات', 'دعم 120 إطار']
    }
  },
  {
    id: 'bf-2042',
    title: 'Battlefield 2042',
    slug: 'battlefield-2042',
    price: 12.50,
    originalPrice: 25.00,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=900&auto=format&fit=crop',
    description: 'حرب شاملة في ساحات معارك ضخمة تتسع لـ 128 لاعباً. أسلحة مستقبلية ومركبات فتاكة.',
    genre: 'Shooter',
    platform: 'PC',
    category: 'game',
    isActive: true,
    isFlashSale: false,
    rating: 4.2,
    reviewsCount: 1500,
    metadata: {
      tags: ['war', 'shooting', 'multiplayer'],
      videoUrl: 'Oc_DJm7se3M',
      videoStart: 10,
      videoEnd: 50,
      features: ['خرائط ضخمة', '128 لاعب', 'طقس ديناميكي', 'مركبات متنوعة']
    }
  },
  {
    id: 'helldivers-2',
    title: 'Helldivers 2',
    slug: 'helldivers-2',
    price: 16.90,
    image: 'https://images.unsplash.com/photo-1615671524827-c1fe3973b648?q=80&w=900&auto=format&fit=crop',
    description: 'انشر الديمقراطية في المجرة! لعبة تعاونية تتطلب التنسيق للقضاء على الحشرات والروبوتات.',
    genre: 'Shooter',
    platform: 'PS5',
    category: 'game',
    isActive: true,
    isFlashSale: false,
    rating: 5.0,
    reviewsCount: 8000,
    metadata: {
      tags: ['coop', 'shooter', 'sci-fi'],
      videoUrl: 'T95WwXem8Vg',
      videoStart: 576,
      videoEnd: 616,
      features: ['لعب تعاوني', 'نيران صديقة', 'استراتيجيات عميقة', 'تحديثات مستمرة']
    }
  },
  {
    id: 'fc-25',
    title: 'EA SPORTS FC 25',
    slug: 'fc-25',
    price: 24.00,
    originalPrice: 30.00,
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=900&auto=format&fit=crop',
    description: 'اللعبة الشعبية الأولى عالمياً. تحكم في فريقك المفضل ونافس في أكبر البطولات.',
    genre: 'Sports',
    platform: 'PS5',
    category: 'game',
    isActive: true,
    isFlashSale: true,
    rating: 4.5,
    reviewsCount: 3200,
    metadata: {
      tags: ['sports', 'football', 'soccer'],
      videoUrl: '5xK7Wr-86Ew',
      videoStart: 50,
      videoEnd: 90,
      features: ['واقعية المباريات', 'Ultimate Team', 'أطوار متعددة', 'تحديثات مباشرة']
    }
  },
  {
    id: 'gow-ragnarok',
    title: 'God of War Ragnarök',
    slug: 'gow-ragnarok',
    price: 26.90,
    image: 'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/67f9zS9sqS0pT7p0Z7q2O4u1.png',
    description: 'انطلق في رحلة ملحمية ومؤثرة مع كراتوس وأتريوس، حيث يواجهان صراعاً مع الآلهة في قلب العوالم التسعة.',
    genre: 'Adventure',
    platform: 'PS5',
    category: 'game',
    isActive: true,
    isFlashSale: false,
    rating: 4.9,
    reviewsCount: 5400,
    metadata: {
      tags: ['adventure', 'action', 'story'],
      videoUrl: 'hfJ4Km46A-0',
      features: ['قتال سينمائي', 'قصة ملحمية', 'عالم مفتوح غني', 'دعم 4K']
    }
  },
  {
    id: 'spider-man-2',
    title: "Marvel's Spider-Man 2",
    slug: 'spider-man-2',
    price: 26.90,
    image: 'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/6R7R7R7R7R7R7R7R7R7R7R7R.png',
    description: 'حلق وتأرجح في مدينة نيويورك مع بيتر باركر ومايلز موراليس لمواجهة الشرير "فينوم" في مغامرة سينمائية.',
    genre: 'Adventure',
    platform: 'PS5',
    category: 'game',
    isActive: true,
    isFlashSale: false,
    rating: 4.8,
    reviewsCount: 4200,
    metadata: {
      tags: ['adventure', 'superhero', 'action'],
      videoUrl: '9fH5R6Y3I4Y',
      features: ['شخصيتان قابلتان للعب', 'تأرجح سريع جداً', 'أشرار مارفل الأيقونيين', 'دعم ميزات DualSense']
    }
  },
  {
    id: 'steam-10-us',
    title: 'Steam Gift Card $10 (US)',
    slug: 'steam-10-us',
    price: 4.20,
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=900&auto=format&fit=crop',
    description: 'شحن رصيد ستيم للحسابات الأمريكية. تسليم فوري للكود.',
    genre: 'Adventure',
    platform: 'PC',
    category: 'card',
    isActive: true,
    isFlashSale: false,
    rating: 5.0,
    reviewsCount: 8500,
    metadata: {
      tags: ['cards', 'steam', 'balance'],
      stockStatus: 'IN_STOCK',
      features: ['تسليم فوري', 'متوافق مع US', 'لا تنتهي الصلاحية']
    }
  },
  {
    id: 'psn-20-om',
    title: 'PSN Card $20 (Oman)',
    slug: 'psn-20-om',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=900&auto=format&fit=crop',
    description: 'بطاقة بلايستيشن ستور للحساب العماني بقيمة 20 دولار.',
    genre: 'Adventure',
    platform: 'PS5',
    category: 'card',
    isActive: true,
    isFlashSale: false,
    rating: 4.9,
    reviewsCount: 3200,
    metadata: {
      tags: ['cards', 'psn', 'playstation'],
      stockStatus: 'IN_STOCK',
      features: ['تسليم فوري', 'متوافق مع Oman', 'لا تنتهي الصلاحية']
    }
  }
]

async function seedProducts() {
  console.log('🌱 Starting product seed...')
  console.log('📊 Target record count:', products.length)
  console.log('🎯 Priority target: Battlefield 6 (Price: 44.45)')
  console.log('')

  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  for (const product of products) {
    try {
      const result = await prisma.product.upsert({
        where: { id: product.id },
        update: {
          ...product,
          updatedAt: new Date()
        },
        create: {
          ...product,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // VERIFICATION: Ensure data was persisted correctly
      if (result.id !== product.id) {
        throw new Error(`ID mismatch for ${product.id}`)
      }
      
      // Convert Prisma Decimal to number for comparison
      const resultPrice = typeof result.price === 'object' && result.price !== null 
        ? parseFloat(result.price.toString()) 
        : Number(result.price)
      if (Math.abs(resultPrice - product.price) > 0.001) {
        throw new Error(`Price mismatch for ${product.id}: expected ${product.price}, got ${resultPrice}`)
      }

      if (result.title !== product.title) {
        throw new Error(`Title mismatch for ${product.id}`)
      }

      successCount++
      console.log(`✅ ${result.id}: ${result.title} (Price: ${result.price})`)
    } catch (error) {
      errorCount++
      const errorMsg = `❌ Failed to seed ${product.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error(errorMsg)
      errors.push(errorMsg)
    }
  }

  console.log('')
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║           SEEDING COMPLETE REPORT              ║')
  console.log('╠════════════════════════════════════════════════╣')
  console.log(`║  Total Products: ${products.length.toString().padEnd(28)} ║`)
  console.log(`║  Successful: ${successCount.toString().padEnd(32)} ║`)
  console.log(`║  Failed: ${errorCount.toString().padEnd(36)} ║`)
  console.log('╚════════════════════════════════════════════════╝')
  console.log('')

  // Verify Battlefield 6 specifically
  console.log('🔍 VERIFYING BATTLEFIELD 6 RECORD...')
  const bf6 = await prisma.product.findUnique({
    where: { id: 'battlefield-6' }
  })

  if (bf6) {
    console.log('✅ Battlefield 6 FOUND in database')
    console.log(`   ID: ${bf6.id}`)
    console.log(`   Title: ${bf6.title}`)
    console.log(`   Price: ${bf6.price} (Expected: 44.45)`)
    console.log(`   isActive: ${bf6.isActive}`)
    console.log(`   updatedAt: ${bf6.updatedAt}`)
    console.log(`   YouTube ID: ${(bf6.metadata as any)?.videoUrl || 'N/A'}`)
    
    // Character-level integrity check
    const expectedPrice = '44.45'
    const actualPrice = bf6.price?.toString() || ''
    const priceMatch = actualPrice === expectedPrice
    
    console.log('')
    console.log('📋 CHARACTER INTEGRITY AUDIT:')
    console.log(`   Expected Price: "${expectedPrice}"`)
    console.log(`   Actual Price: "${actualPrice}"`)
    console.log(`   Match: ${priceMatch ? '✅ PASS' : '❌ FAIL'}`)
    
    if (!priceMatch) {
      console.error('⚠️  CHARACTER MISMATCH DETECTED!')
      for (let i = 0; i < Math.max(expectedPrice.length, actualPrice.length); i++) {
        const exp = expectedPrice[i] || '∅'
        const act = actualPrice[i] || '∅'
        const match = exp === act ? '✓' : '✗'
        console.log(`      Position ${i}: Expected '${exp}' | Got '${act}' ${match}`)
      }
    }
  } else {
    console.error('❌ Battlefield 6 NOT FOUND in database!')
  }

  if (errors.length > 0) {
    console.log('')
    console.log('❌ ERRORS ENCOUNTERED:')
    errors.forEach(err => console.log(err))
  }

  return { successCount, errorCount, errors }
}

// Execute seed
seedProducts()
  .then(async (result) => {
    await prisma.$disconnect()
    process.exit(result.errorCount > 0 ? 1 : 0)
  })
  .catch(async (error) => {
    console.error('Fatal error during seeding:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
