import { PartItem } from "@/lib/parts/types";

export const RETAILERS = [
  {
    "id": "ret-shopee",
    "name": "Shopee MY (Official Malls)",
    "slug": "shopee-my",
    "websiteUrl": "https://shopee.com.my",
    "logoUrl": "/images/retailers/shopee.png",
    "isActive": true
  },
  {
    "id": "ret-lazada",
    "name": "Lazada MY (LazMall)",
    "slug": "lazada-my",
    "websiteUrl": "https://lazada.com.my",
    "logoUrl": "/images/retailers/lazada.png",
    "isActive": true
  },
  {
    "id": "ret-pcbyte",
    "name": "PC Byte Malaysia",
    "slug": "pcbyte-my",
    "websiteUrl": "https://www.pcbyte.com.my",
    "logoUrl": "/images/retailers/pcbyte.png",
    "isActive": true
  },
  {
    "id": "ret-idealtech",
    "name": "Ideal Tech PC",
    "slug": "idealtech-my",
    "websiteUrl": "https://idealtech.com.my",
    "logoUrl": "/images/retailers/idealtech.png",
    "isActive": true
  },
  {
    "id": "ret-carousell",
    "name": "Carousell MY",
    "slug": "carousell-my",
    "websiteUrl": "https://www.carousell.com.my",
    "logoUrl": "/images/retailers/carousell.png",
    "isActive": true,
    "isMarketplace": true
  },
  {
    "id": "ret-mudah",
    "name": "Mudah.my",
    "slug": "mudah-my",
    "websiteUrl": "https://www.mudah.my",
    "logoUrl": "/images/retailers/mudah.png",
    "isActive": true,
    "isMarketplace": true
  },
  {
    "id": "ret-lowyat",
    "name": "Lowyat Garage",
    "slug": "lowyat-garage",
    "websiteUrl": "https://forum.lowyat.net/GarageSales",
    "logoUrl": "/images/retailers/lowyat.png",
    "isActive": true,
    "isMarketplace": true
  }
];

export const SEED_PARTS: PartItem[] = [
  {
    "id": "cpu-ryzen-5600",
    "slug": "amd-ryzen-5-5600",
    "name": "AMD Ryzen 5 5600 6-Core Processor",
    "brand": "AMD",
    "model": "Ryzen 5 5600",
    "type": "CPU",
    "benchmarkScore": 21500,
    "bestPriceMyr": 340,
    "inStock": true,
    "specs": {
      "socket": "AM4",
      "tdpWattage": 65,
      "cores": 6,
      "threads": 12,
      "baseClockGhz": 3.5,
      "boostClockGhz": 4.4,
      "integratedGpu": false,
      "coolerIncluded": true
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 439,
        "originalPriceMyr": 529,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=ryzen%205%205600",
        "lastScrapedAt": "2026-09-23T03:28:58.205Z",
        "condition": "new",
        "isMarketplace": false
      },
      {
        "retailerId": "ret-pcbyte",
        "retailerName": "PC Byte Malaysia",
        "retailerSlug": "pcbyte-my",
        "priceMyr": 459,
        "inStock": true,
        "productUrl": "https://www.pcbyte.com.my/product/amd-ryzen-5-5600",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      },
      {
        "retailerId": "ret-carousell",
        "retailerName": "Carousell MY",
        "retailerSlug": "carousell-my",
        "priceMyr": 350,
        "originalPriceMyr": 439,
        "condition": "used_excellent",
        "sellerLocation": "Subang Jaya, Selangor",
        "listingTitle": "Ryzen 5 5600 with original box and unused Wraith Stealth cooler",
        "isMarketplace": true,
        "inStock": true,
        "productUrl": "https://www.carousell.com.my/search/ryzen%205%205600",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z"
      },
      {
        "retailerId": "ret-mudah",
        "retailerName": "Mudah.my",
        "retailerSlug": "mudah-my",
        "priceMyr": 340,
        "originalPriceMyr": 439,
        "condition": "used_good",
        "sellerLocation": "Bayan Lepas, Penang",
        "listingTitle": "AMD Ryzen 5 5600 processor only, working 100%",
        "isMarketplace": true,
        "inStock": true,
        "productUrl": "https://www.mudah.my/malaysia/ryzen-5-5600-for-sale",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z"
      }
    ],
    "bestNewPriceMyr": 439,
    "bestUsedPriceMyr": 340,
    "hasUsedListings": true
  },
  {
    "id": "cpu-ryzen-5700x3d",
    "slug": "amd-ryzen-7-5700x3d",
    "name": "AMD Ryzen 7 5700X3D 8-Core 3D V-Cache Processor",
    "brand": "AMD",
    "model": "Ryzen 7 5700X3D",
    "type": "CPU",
    "benchmarkScore": 28200,
    "bestPriceMyr": 720,
    "inStock": true,
    "specs": {
      "socket": "AM4",
      "tdpWattage": 105,
      "cores": 8,
      "threads": 16,
      "baseClockGhz": 3,
      "boostClockGhz": 4.1,
      "integratedGpu": false,
      "coolerIncluded": false
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 899,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=ryzen%207%205700x3d",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      },
      {
        "retailerId": "ret-carousell",
        "retailerName": "Carousell MY",
        "retailerSlug": "carousell-my",
        "priceMyr": 720,
        "originalPriceMyr": 899,
        "condition": "used_excellent",
        "sellerLocation": "Cheras, KL",
        "listingTitle": "Ryzen 7 5700X3D used 3 months, full receipt and local warranty",
        "isMarketplace": true,
        "inStock": true,
        "productUrl": "https://www.carousell.com.my/search/ryzen%205700x3d",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z"
      }
    ],
    "bestNewPriceMyr": 899,
    "bestUsedPriceMyr": 720,
    "hasUsedListings": true
  },
  {
    "id": "cpu-ryzen-7600",
    "slug": "amd-ryzen-5-7600",
    "name": "AMD Ryzen 5 7600 6-Core AM5 Processor",
    "brand": "AMD",
    "model": "Ryzen 5 7600",
    "type": "CPU",
    "benchmarkScore": 26800,
    "bestPriceMyr": 690,
    "inStock": true,
    "specs": {
      "socket": "AM5",
      "tdpWattage": 65,
      "cores": 6,
      "threads": 12,
      "baseClockGhz": 3.8,
      "boostClockGhz": 5.1,
      "integratedGpu": true,
      "coolerIncluded": true
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 889,
        "originalPriceMyr": 999,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=ryzen%205%207600",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      },
      {
        "retailerId": "ret-idealtech",
        "retailerName": "Ideal Tech PC",
        "retailerSlug": "idealtech-my",
        "priceMyr": 919,
        "inStock": true,
        "productUrl": "https://idealtech.com.my/ryzen-5-7600",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      },
      {
        "retailerId": "ret-lowyat",
        "retailerName": "Lowyat Garage",
        "retailerSlug": "lowyat-garage",
        "priceMyr": 690,
        "originalPriceMyr": 889,
        "condition": "used_excellent",
        "sellerLocation": "Petaling Jaya, Selangor",
        "listingTitle": "AMD Ryzen 5 7600 AM5 complete set with receipt",
        "isMarketplace": true,
        "inStock": true,
        "productUrl": "https://forum.lowyat.net/GarageSales",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z"
      }
    ],
    "bestNewPriceMyr": 889,
    "bestUsedPriceMyr": 690,
    "hasUsedListings": true
  },
  {
    "id": "cpu-ryzen-7800x3d",
    "slug": "amd-ryzen-7-7800x3d",
    "name": "AMD Ryzen 7 7800X3D 8-Core Gaming Flagship Processor",
    "brand": "AMD",
    "model": "Ryzen 7 7800X3D",
    "type": "CPU",
    "benchmarkScore": 34500,
    "bestPriceMyr": 1550,
    "inStock": true,
    "specs": {
      "socket": "AM5",
      "tdpWattage": 120,
      "cores": 8,
      "threads": 16,
      "baseClockGhz": 4.2,
      "boostClockGhz": 5,
      "integratedGpu": true,
      "coolerIncluded": false
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 1799,
        "originalPriceMyr": 1999,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=ryzen%207%207800x3d",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      },
      {
        "retailerId": "ret-carousell",
        "retailerName": "Carousell MY",
        "retailerSlug": "carousell-my",
        "priceMyr": 1550,
        "originalPriceMyr": 1889,
        "condition": "used_excellent",
        "sellerLocation": "Puchong, Selangor",
        "listingTitle": "Ryzen 7 7800X3D upgrading to 9800X3D, pristine pins",
        "isMarketplace": true,
        "inStock": true,
        "productUrl": "https://www.carousell.com.my/search/7800x3d",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z"
      }
    ],
    "bestNewPriceMyr": 1799,
    "bestUsedPriceMyr": 1550,
    "hasUsedListings": true
  },
  {
    "id": "cpu-intel-12400f",
    "slug": "intel-core-i5-12400f",
    "name": "Intel Core i5-12400F 6-Core LGA1700 Processor",
    "brand": "Intel",
    "model": "Core i5-12400F",
    "type": "CPU",
    "benchmarkScore": 19800,
    "bestPriceMyr": 380,
    "inStock": true,
    "specs": {
      "socket": "LGA1700",
      "tdpWattage": 65,
      "cores": 6,
      "threads": 12,
      "baseClockGhz": 2.5,
      "boostClockGhz": 4.4,
      "integratedGpu": false,
      "coolerIncluded": true
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 479,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=i5%2012400f",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      },
      {
        "retailerId": "ret-mudah",
        "retailerName": "Mudah.my",
        "retailerSlug": "mudah-my",
        "priceMyr": 380,
        "originalPriceMyr": 519,
        "condition": "used_good",
        "sellerLocation": "Shah Alam, Selangor",
        "listingTitle": "Intel Core i5-12400F LGA1700 processor with stock cooler",
        "isMarketplace": true,
        "inStock": true,
        "productUrl": "https://www.mudah.my/malaysia/i5-12400f",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z"
      }
    ],
    "bestNewPriceMyr": 479,
    "bestUsedPriceMyr": 380,
    "hasUsedListings": true
  },
  {
    "id": "cpu-intel-13600kf",
    "slug": "intel-core-i5-13600kf",
    "name": "Intel Core i5-13600KF 14-Core High-Performance Processor",
    "brand": "Intel",
    "model": "Core i5-13600KF",
    "type": "CPU",
    "benchmarkScore": 37500,
    "bestPriceMyr": 920,
    "inStock": true,
    "specs": {
      "socket": "LGA1700",
      "tdpWattage": 125,
      "cores": 14,
      "threads": 20,
      "baseClockGhz": 3.5,
      "boostClockGhz": 5.1,
      "integratedGpu": false,
      "coolerIncluded": false
    },
    "prices": [
      {
        "retailerId": "ret-lazada",
        "retailerName": "Lazada MY",
        "retailerSlug": "lazada-my",
        "priceMyr": 1189,
        "inStock": true,
        "productUrl": "https://lazada.com.my/search?q=i5+13600kf",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      },
      {
        "retailerId": "ret-lowyat",
        "retailerName": "Lowyat Garage",
        "retailerSlug": "lowyat-garage",
        "priceMyr": 920,
        "originalPriceMyr": 1199,
        "condition": "used_excellent",
        "sellerLocation": "Kuala Lumpur",
        "listingTitle": "Intel i5-13600KF never overclocked, warranty till 2026",
        "isMarketplace": true,
        "inStock": true,
        "productUrl": "https://forum.lowyat.net/GarageSales",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z"
      }
    ],
    "bestNewPriceMyr": 1189,
    "bestUsedPriceMyr": 920,
    "hasUsedListings": true
  },
  {
    "id": "gpu-rx-6600",
    "slug": "sapphire-pulse-radeon-rx-6600-8gb",
    "name": "Sapphire Pulse AMD Radeon RX 6600 8GB GDDR6",
    "brand": "Sapphire",
    "model": "Radeon RX 6600 Pulse",
    "type": "GPU",
    "benchmarkScore": 15200,
    "bestPriceMyr": 590,
    "inStock": true,
    "specs": {
      "chipBrand": "AMD",
      "vramGb": 8,
      "lengthMm": 193,
      "slotWidth": 2,
      "tdpWattage": 132,
      "recommendedPsuWattage": 450,
      "powerConnectors": "1x 8-pin PCIe",
      "has12Vhpwr": false
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 899,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=rx%206600%20sapphire",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      },
      {
        "retailerId": "ret-carousell",
        "retailerName": "Carousell MY",
        "retailerSlug": "carousell-my",
        "priceMyr": 620,
        "originalPriceMyr": 899,
        "condition": "used_excellent",
        "sellerLocation": "Ampang, Selangor",
        "listingTitle": "Sapphire Pulse RX 6600 8GB like new with box",
        "isMarketplace": true,
        "inStock": true,
        "productUrl": "https://www.carousell.com.my/search/rx%206600",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z"
      },
      {
        "retailerId": "ret-mudah",
        "retailerName": "Mudah.my",
        "retailerSlug": "mudah-my",
        "priceMyr": 590,
        "condition": "used_good",
        "sellerLocation": "Ipoh, Perak",
        "listingTitle": "ASUS Dual Radeon RX 6600 8GB 100% working Furmark tested",
        "isMarketplace": true,
        "inStock": true,
        "productUrl": "https://www.mudah.my/malaysia/rx-6600",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z"
      }
    ],
    "bestNewPriceMyr": 899,
    "bestUsedPriceMyr": 590,
    "hasUsedListings": true
  },
  {
    "id": "gpu-rtx-4060",
    "slug": "asus-dual-geforce-rtx-4060-oc-8gb",
    "name": "ASUS Dual GeForce RTX 4060 OC Edition 8GB GDDR6",
    "brand": "ASUS",
    "model": "Dual RTX 4060 OC",
    "type": "GPU",
    "benchmarkScore": 19800,
    "bestPriceMyr": 1180,
    "inStock": true,
    "specs": {
      "chipBrand": "NVIDIA",
      "vramGb": 8,
      "lengthMm": 227,
      "slotWidth": 2.5,
      "tdpWattage": 115,
      "recommendedPsuWattage": 550,
      "powerConnectors": "1x 8-pin PCIe",
      "has12Vhpwr": false
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 1389,
        "originalPriceMyr": 1499,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=asus%20dual%20rtx%204060",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      },
      {
        "retailerId": "ret-carousell",
        "retailerName": "Carousell MY",
        "retailerSlug": "carousell-my",
        "priceMyr": 1180,
        "originalPriceMyr": 1389,
        "condition": "used_excellent",
        "sellerLocation": "Cyberjaya, Selangor",
        "listingTitle": "Gigabyte RTX 4060 Eagle OC 8GB used 6 months, still under warranty",
        "isMarketplace": true,
        "inStock": true,
        "productUrl": "https://www.carousell.com.my/search/rtx%204060",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z"
      }
    ],
    "bestNewPriceMyr": 1389,
    "bestUsedPriceMyr": 1180,
    "hasUsedListings": true
  },
  {
    "id": "gpu-rx-7700xt",
    "slug": "sapphire-pure-radeon-rx-7700-xt-12gb",
    "name": "Sapphire Pure AMD Radeon RX 7700 XT 12GB GDDR6",
    "brand": "Sapphire",
    "model": "Radeon RX 7700 XT Pure",
    "type": "GPU",
    "benchmarkScore": 26500,
    "bestPriceMyr": 2099,
    "inStock": true,
    "specs": {
      "chipBrand": "AMD",
      "vramGb": 12,
      "lengthMm": 280,
      "slotWidth": 2.5,
      "tdpWattage": 245,
      "recommendedPsuWattage": 700,
      "powerConnectors": "2x 8-pin PCIe",
      "has12Vhpwr": false
    },
    "prices": [
      {
        "retailerId": "ret-pcbyte",
        "retailerName": "PC Byte Malaysia",
        "retailerSlug": "pcbyte-my",
        "priceMyr": 2099,
        "inStock": true,
        "productUrl": "https://www.pcbyte.com.my/product/rx-7700-xt",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 2099,
    "hasUsedListings": false
  },
  {
    "id": "gpu-rtx-4070-super",
    "slug": "zotac-gaming-geforce-rtx-4070-super-twin-edge-12gb",
    "name": "ZOTAC GAMING GeForce RTX 4070 SUPER Twin Edge 12GB",
    "brand": "ZOTAC",
    "model": "RTX 4070 SUPER Twin Edge",
    "type": "GPU",
    "benchmarkScore": 31200,
    "bestPriceMyr": 2450,
    "inStock": true,
    "specs": {
      "chipBrand": "NVIDIA",
      "vramGb": 12,
      "lengthMm": 234,
      "slotWidth": 2,
      "tdpWattage": 220,
      "recommendedPsuWattage": 650,
      "powerConnectors": "1x 16-pin 12VHPWR",
      "has12Vhpwr": true
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 2799,
        "originalPriceMyr": 2999,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=rtx%204070%20super%20zotac",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      },
      {
        "retailerId": "ret-carousell",
        "retailerName": "Carousell MY",
        "retailerSlug": "carousell-my",
        "priceMyr": 2450,
        "originalPriceMyr": 2899,
        "condition": "used_excellent",
        "sellerLocation": "Mont Kiara, KL",
        "listingTitle": "Palit GeForce RTX 4070 Super Dual 12GB complete packaging",
        "isMarketplace": true,
        "inStock": true,
        "productUrl": "https://www.carousell.com.my/search/rtx%204070%20super",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z"
      }
    ],
    "bestNewPriceMyr": 2799,
    "bestUsedPriceMyr": 2450,
    "hasUsedListings": true
  },
  {
    "id": "gpu-rtx-4080-super",
    "slug": "gigabyte-geforce-rtx-4080-super-windforce-v2-16gb",
    "name": "Gigabyte GeForce RTX 4080 SUPER WINDFORCE V2 16GB",
    "brand": "Gigabyte",
    "model": "RTX 4080 SUPER WINDFORCE",
    "type": "GPU",
    "benchmarkScore": 43000,
    "bestPriceMyr": 4799,
    "inStock": true,
    "specs": {
      "chipBrand": "NVIDIA",
      "vramGb": 16,
      "lengthMm": 330,
      "slotWidth": 3,
      "tdpWattage": 320,
      "recommendedPsuWattage": 850,
      "powerConnectors": "1x 16-pin 12VHPWR",
      "has12Vhpwr": true
    },
    "prices": [
      {
        "retailerId": "ret-idealtech",
        "retailerName": "Ideal Tech PC",
        "retailerSlug": "idealtech-my",
        "priceMyr": 4799,
        "inStock": true,
        "productUrl": "https://idealtech.com.my/rtx-4080-super-gigabyte",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 4799,
    "hasUsedListings": false
  },
  {
    "id": "mobo-msi-b550m-pro-vdh",
    "slug": "msi-b550m-pro-vdh-wifi",
    "name": "MSI B550M PRO-VDH WIFI Micro-ATX Motherboard",
    "brand": "MSI",
    "model": "B550M PRO-VDH WIFI",
    "type": "MOTHERBOARD",
    "benchmarkScore": 100,
    "bestPriceMyr": 280,
    "inStock": true,
    "specs": {
      "socket": "AM4",
      "chipset": "AMD B550",
      "formFactor": "Micro-ATX",
      "ramType": "DDR4",
      "ramSlots": 4,
      "maxRamSpeedMhz": 4400,
      "m2Slots": 2,
      "sataPorts": 4,
      "pcieGen": 4
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 419,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=b550m%20pro%20vdh",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      },
      {
        "retailerId": "ret-carousell",
        "retailerName": "Carousell MY",
        "retailerSlug": "carousell-my",
        "priceMyr": 280,
        "originalPriceMyr": 429,
        "condition": "used_excellent",
        "sellerLocation": "Klang, Selangor",
        "listingTitle": "MSI B550M PRO-VDH WIFI with IO shield and antennas",
        "isMarketplace": true,
        "inStock": true,
        "productUrl": "https://www.carousell.com.my/search/b550m%20pro%20vdh",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z"
      }
    ],
    "bestNewPriceMyr": 419,
    "bestUsedPriceMyr": 280,
    "hasUsedListings": true
  },
  {
    "id": "mobo-asrock-b650m-hdv",
    "slug": "asrock-b650m-hdv-m2",
    "name": "ASRock B650M-HDV/M.2 AM5 Micro-ATX Motherboard",
    "brand": "ASRock",
    "model": "B650M-HDV/M.2",
    "type": "MOTHERBOARD",
    "benchmarkScore": 100,
    "bestPriceMyr": 420,
    "inStock": true,
    "specs": {
      "socket": "AM5",
      "chipset": "AMD B650",
      "formFactor": "Micro-ATX",
      "ramType": "DDR5",
      "ramSlots": 2,
      "maxRamSpeedMhz": 6400,
      "m2Slots": 2,
      "sataPorts": 4,
      "pcieGen": 5
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 499,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=b650m-hdv/m.2",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      },
      {
        "retailerId": "ret-lowyat",
        "retailerName": "Lowyat Garage",
        "retailerSlug": "lowyat-garage",
        "priceMyr": 420,
        "originalPriceMyr": 549,
        "condition": "used_excellent",
        "sellerLocation": "Petaling Jaya, Selangor",
        "listingTitle": "ASRock B650M-HDV/M.2 AM5 board, tested and bios updated",
        "isMarketplace": true,
        "inStock": true,
        "productUrl": "https://forum.lowyat.net/GarageSales",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z"
      }
    ],
    "bestNewPriceMyr": 499,
    "bestUsedPriceMyr": 420,
    "hasUsedListings": true
  },
  {
    "id": "mobo-msi-b650-tomahawk",
    "slug": "msi-mag-b650-tomahawk-wifi",
    "name": "MSI MAG B650 TOMAHAWK WIFI ATX Motherboard",
    "brand": "MSI",
    "model": "MAG B650 TOMAHAWK WIFI",
    "type": "MOTHERBOARD",
    "benchmarkScore": 120,
    "bestPriceMyr": 989,
    "inStock": true,
    "specs": {
      "socket": "AM5",
      "chipset": "AMD B650",
      "formFactor": "ATX",
      "ramType": "DDR5",
      "ramSlots": 4,
      "maxRamSpeedMhz": 6600,
      "m2Slots": 3,
      "sataPorts": 6,
      "pcieGen": 4
    },
    "prices": [
      {
        "retailerId": "ret-pcbyte",
        "retailerName": "PC Byte Malaysia",
        "retailerSlug": "pcbyte-my",
        "priceMyr": 989,
        "inStock": true,
        "productUrl": "https://www.pcbyte.com.my/product/b650-tomahawk",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 989,
    "hasUsedListings": false
  },
  {
    "id": "mobo-asus-prime-b760m-d4",
    "slug": "asus-prime-b760m-a-wifi-d4",
    "name": "ASUS PRIME B760M-A WIFI D4 LGA1700 Motherboard",
    "brand": "ASUS",
    "model": "PRIME B760M-A WIFI D4",
    "type": "MOTHERBOARD",
    "benchmarkScore": 100,
    "bestPriceMyr": 549,
    "inStock": true,
    "specs": {
      "socket": "LGA1700",
      "chipset": "Intel B760",
      "formFactor": "Micro-ATX",
      "ramType": "DDR4",
      "ramSlots": 4,
      "maxRamSpeedMhz": 5333,
      "m2Slots": 2,
      "sataPorts": 4,
      "pcieGen": 4
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 549,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=b760m%20prime%20d4",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 549,
    "hasUsedListings": false
  },
  {
    "id": "mobo-msi-z790-a-pro-max",
    "slug": "msi-pro-z790-a-max-wifi",
    "name": "MSI PRO Z790-A MAX WIFI ATX LGA1700 Motherboard",
    "brand": "MSI",
    "model": "PRO Z790-A MAX WIFI",
    "type": "MOTHERBOARD",
    "benchmarkScore": 130,
    "bestPriceMyr": 1199,
    "inStock": true,
    "specs": {
      "socket": "LGA1700",
      "chipset": "Intel Z790",
      "formFactor": "ATX",
      "ramType": "DDR5",
      "ramSlots": 4,
      "maxRamSpeedMhz": 7200,
      "m2Slots": 4,
      "sataPorts": 6,
      "pcieGen": 5
    },
    "prices": [
      {
        "retailerId": "ret-idealtech",
        "retailerName": "Ideal Tech PC",
        "retailerSlug": "idealtech-my",
        "priceMyr": 1199,
        "inStock": true,
        "productUrl": "https://idealtech.com.my/z790-a-max",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 1199,
    "hasUsedListings": false
  },
  {
    "id": "ram-kingston-fury-16gb-d4",
    "slug": "kingston-fury-beast-16gb-2x8gb-ddr4-3200",
    "name": "Kingston FURY Beast 16GB (2x8GB) DDR4-3200MHz CL16",
    "brand": "Kingston",
    "model": "FURY Beast DDR4 16GB",
    "type": "RAM",
    "benchmarkScore": 3200,
    "bestPriceMyr": 179,
    "inStock": true,
    "specs": {
      "ramType": "DDR4",
      "capacityGb": 16,
      "moduleCount": 2,
      "speedMhz": 3200,
      "casLatency": 16
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 179,
        "originalPriceMyr": 199,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=kingston%20fury%2016gb%203200",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 179,
    "hasUsedListings": false
  },
  {
    "id": "ram-corsair-lpx-32gb-d4",
    "slug": "corsair-vengeance-lpx-32gb-2x16gb-ddr4-3200",
    "name": "Corsair Vengeance LPX 32GB (2x16GB) DDR4-3200MHz CL16",
    "brand": "Corsair",
    "model": "Vengeance LPX DDR4 32GB",
    "type": "RAM",
    "benchmarkScore": 3200,
    "bestPriceMyr": 309,
    "inStock": true,
    "specs": {
      "ramType": "DDR4",
      "capacityGb": 32,
      "moduleCount": 2,
      "speedMhz": 3200,
      "casLatency": 16
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 309,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=corsair%20lpx%2032gb%203200",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 309,
    "hasUsedListings": false
  },
  {
    "id": "ram-gskill-ripjaws-32gb-d5",
    "slug": "gskill-ripjaws-s5-32gb-2x16gb-ddr5-6000-cl30",
    "name": "G.Skill Ripjaws S5 32GB (2x16GB) DDR5-6000MHz CL30",
    "brand": "G.Skill",
    "model": "Ripjaws S5 DDR5 32GB",
    "type": "RAM",
    "benchmarkScore": 6000,
    "bestPriceMyr": 489,
    "inStock": true,
    "specs": {
      "ramType": "DDR5",
      "capacityGb": 32,
      "moduleCount": 2,
      "speedMhz": 6000,
      "casLatency": 30
    },
    "prices": [
      {
        "retailerId": "ret-pcbyte",
        "retailerName": "PC Byte Malaysia",
        "retailerSlug": "pcbyte-my",
        "priceMyr": 489,
        "inStock": true,
        "productUrl": "https://www.pcbyte.com.my/product/gskill-32gb-6000-cl30",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 489,
    "hasUsedListings": false
  },
  {
    "id": "ram-kingston-fury-32gb-d5",
    "slug": "kingston-fury-beast-32gb-2x16gb-ddr5-5600",
    "name": "Kingston FURY Beast 32GB (2x16GB) DDR5-5600MHz CL36",
    "brand": "Kingston",
    "model": "FURY Beast DDR5 32GB",
    "type": "RAM",
    "benchmarkScore": 5600,
    "bestPriceMyr": 419,
    "inStock": true,
    "specs": {
      "ramType": "DDR5",
      "capacityGb": 32,
      "moduleCount": 2,
      "speedMhz": 5600,
      "casLatency": 36
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 419,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=kingston%20fury%2032gb%205600",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 419,
    "hasUsedListings": false
  },
  {
    "id": "ssd-kingston-nv2-1tb",
    "slug": "kingston-nv2-1tb-pcie-4-nvme-ssd",
    "name": "Kingston NV2 1TB PCIe 4.0 NVMe M.2 SSD",
    "brand": "Kingston",
    "model": "NV2 1TB",
    "type": "STORAGE",
    "benchmarkScore": 3500,
    "bestPriceMyr": 259,
    "inStock": true,
    "specs": {
      "formFactor": "M.2 2280",
      "interface": "NVMe PCIe 4.0",
      "capacityGb": 1000,
      "readSpeedMbps": 3500
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 259,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=kingston%20nv2%201tb",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 259,
    "hasUsedListings": false
  },
  {
    "id": "ssd-lexar-nm790-2tb",
    "slug": "lexar-nm790-2tb-pcie-4-nvme-ssd",
    "name": "Lexar NM790 2TB High-Speed PCIe 4.0 NVMe M.2 SSD",
    "brand": "Lexar",
    "model": "NM790 2TB",
    "type": "STORAGE",
    "benchmarkScore": 7400,
    "bestPriceMyr": 589,
    "inStock": true,
    "specs": {
      "formFactor": "M.2 2280",
      "interface": "NVMe PCIe 4.0",
      "capacityGb": 2000,
      "readSpeedMbps": 7400
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 589,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=lexar%20nm790%202tb",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 589,
    "hasUsedListings": false
  },
  {
    "id": "psu-msi-a550bn",
    "slug": "msi-mag-a550bn-550w-80-plus-bronze",
    "name": "MSI MAG A550BN 550W 80+ Bronze Power Supply",
    "brand": "MSI",
    "model": "MAG A550BN",
    "type": "PSU",
    "benchmarkScore": 550,
    "bestPriceMyr": 209,
    "inStock": true,
    "specs": {
      "wattage": 550,
      "efficiencyRating": "80+ Bronze",
      "formFactor": "ATX",
      "modularity": "Non",
      "has12Vhpwr": false
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 209,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=msi%20a550bn",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 209,
    "hasUsedListings": false
  },
  {
    "id": "psu-coolermaster-mwe-650",
    "slug": "cooler-master-mwe-650-bronze-v2",
    "name": "Cooler Master MWE Bronze 650W V2 80+ Bronze Power Supply",
    "brand": "Cooler Master",
    "model": "MWE 650 Bronze V2",
    "type": "PSU",
    "benchmarkScore": 650,
    "bestPriceMyr": 269,
    "inStock": true,
    "specs": {
      "wattage": 650,
      "efficiencyRating": "80+ Bronze",
      "formFactor": "ATX",
      "modularity": "Non",
      "has12Vhpwr": false
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 269,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=cooler%20master%20mwe%20650",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 269,
    "hasUsedListings": false
  },
  {
    "id": "psu-corsair-rm750e",
    "slug": "corsair-rm750e-750w-80-plus-gold-atx3",
    "name": "Corsair RM750e 750W 80+ Gold Fully Modular ATX 3.0 Power Supply",
    "brand": "Corsair",
    "model": "RM750e (2023)",
    "type": "PSU",
    "benchmarkScore": 750,
    "bestPriceMyr": 479,
    "inStock": true,
    "specs": {
      "wattage": 750,
      "efficiencyRating": "80+ Gold",
      "formFactor": "ATX",
      "modularity": "Full",
      "has12Vhpwr": true
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 479,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=corsair%20rm750e",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 479,
    "hasUsedListings": false
  },
  {
    "id": "psu-seasonic-focus-850",
    "slug": "seasonic-focus-gx-850-850w-80-plus-gold-atx3",
    "name": "Seasonic FOCUS GX-850 850W 80+ Gold Fully Modular ATX 3.0",
    "brand": "Seasonic",
    "model": "FOCUS GX-850 ATX 3.0",
    "type": "PSU",
    "benchmarkScore": 850,
    "bestPriceMyr": 649,
    "inStock": true,
    "specs": {
      "wattage": 850,
      "efficiencyRating": "80+ Gold",
      "formFactor": "ATX",
      "modularity": "Full",
      "has12Vhpwr": true
    },
    "prices": [
      {
        "retailerId": "ret-idealtech",
        "retailerName": "Ideal Tech PC",
        "retailerSlug": "idealtech-my",
        "priceMyr": 649,
        "inStock": true,
        "productUrl": "https://idealtech.com.my/seasonic-gx-850",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 649,
    "hasUsedListings": false
  },
  {
    "id": "case-tecware-forge-m",
    "slug": "tecware-forge-m-argb-matx-case",
    "name": "Tecware Forge M ARGB High Airflow Micro-ATX Case",
    "brand": "Tecware",
    "model": "Forge M ARGB",
    "type": "CASE",
    "benchmarkScore": 100,
    "bestPriceMyr": 159,
    "inStock": true,
    "specs": {
      "formFactorSupport": [
        "Micro-ATX",
        "Mini-ITX"
      ],
      "maxGpuLengthMm": 340,
      "maxCpuCoolerHeightMm": 160,
      "maxPsuLengthMm": 180
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 159,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=tecware%20forge%20m",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 159,
    "hasUsedListings": false
  },
  {
    "id": "case-montech-air-903",
    "slug": "montech-air-903-max-atx-case",
    "name": "Montech AIR 903 MAX Mesh High-Airflow ATX Case",
    "brand": "Montech",
    "model": "AIR 903 MAX",
    "type": "CASE",
    "benchmarkScore": 120,
    "bestPriceMyr": 279,
    "inStock": true,
    "specs": {
      "formFactorSupport": [
        "ATX",
        "Micro-ATX",
        "Mini-ITX"
      ],
      "maxGpuLengthMm": 400,
      "maxCpuCoolerHeightMm": 180,
      "maxPsuLengthMm": 240
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 279,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=montech%20air%20903%20max",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 279,
    "hasUsedListings": false
  },
  {
    "id": "case-nr200",
    "slug": "cooler-master-masterbox-nr200-itx-case",
    "name": "Cooler Master MasterBox NR200 Mini-ITX SFF Case",
    "brand": "Cooler Master",
    "model": "MasterBox NR200",
    "type": "CASE",
    "benchmarkScore": 110,
    "bestPriceMyr": 319,
    "inStock": true,
    "specs": {
      "formFactorSupport": [
        "Mini-ITX"
      ],
      "maxGpuLengthMm": 330,
      "maxCpuCoolerHeightMm": 155,
      "maxPsuLengthMm": 130
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 319,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=cooler%20master%20nr200",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 319,
    "hasUsedListings": false
  },
  {
    "id": "cooler-thermalright-pa120",
    "slug": "thermalright-peerless-assassin-120-se-argb",
    "name": "Thermalright Peerless Assassin 120 SE ARGB Dual Tower Cooler",
    "brand": "Thermalright",
    "model": "Peerless Assassin 120 SE",
    "type": "COOLER",
    "benchmarkScore": 245,
    "bestPriceMyr": 159,
    "inStock": true,
    "specs": {
      "coolerType": "Air",
      "supportedSockets": [
        "AM4",
        "AM5",
        "LGA1700",
        "LGA1851"
      ],
      "heightMm": 155,
      "maxTdpWattage": 245
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 159,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=peerless%20assassin%20120%20se",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 159,
    "hasUsedListings": false
  },
  {
    "id": "cooler-deepcool-ak400",
    "slug": "deepcool-ak400-single-tower-cpu-cooler",
    "name": "DeepCool AK400 High Performance Single Tower Air Cooler",
    "brand": "DeepCool",
    "model": "AK400",
    "type": "COOLER",
    "benchmarkScore": 220,
    "bestPriceMyr": 70,
    "inStock": true,
    "specs": {
      "coolerType": "Air",
      "supportedSockets": [
        "AM4",
        "AM5",
        "LGA1700",
        "LGA1851"
      ],
      "heightMm": 155,
      "maxTdpWattage": 220
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 115,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=deepcool%20ak400",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      },
      {
        "retailerId": "ret-carousell",
        "retailerName": "Carousell MY",
        "retailerSlug": "carousell-my",
        "priceMyr": 70,
        "originalPriceMyr": 115,
        "condition": "used_good",
        "sellerLocation": "Subang Jaya, Selangor",
        "listingTitle": "DeepCool AK400 CPU air cooler AM4/AM5/LGA1700 brackets included",
        "isMarketplace": true,
        "inStock": true,
        "productUrl": "https://www.carousell.com.my/search/deepcool%20ak400",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z"
      }
    ],
    "bestNewPriceMyr": 115,
    "bestUsedPriceMyr": 70,
    "hasUsedListings": true
  },
  {
    "id": "cooler-thermalright-aqua-360",
    "slug": "thermalright-aqua-elite-360-v3-argb-aio",
    "name": "Thermalright Aqua Elite 360 V3 ARGB 360mm Liquid Cooler",
    "brand": "Thermalright",
    "model": "Aqua Elite 360 V3",
    "type": "COOLER",
    "benchmarkScore": 300,
    "bestPriceMyr": 289,
    "inStock": true,
    "specs": {
      "coolerType": "AIO 360",
      "supportedSockets": [
        "AM4",
        "AM5",
        "LGA1700",
        "LGA1851"
      ],
      "heightMm": 52,
      "maxTdpWattage": 300
    },
    "prices": [
      {
        "retailerId": "ret-shopee",
        "retailerName": "Shopee MY",
        "retailerSlug": "shopee-my",
        "priceMyr": 289,
        "inStock": true,
        "productUrl": "https://shopee.com.my/search?keyword=thermalright%20aqua%20elite%20360",
        "lastScrapedAt": "2026-09-23T03:28:58.206Z",
        "condition": "new",
        "isMarketplace": false
      }
    ],
    "bestNewPriceMyr": 289,
    "hasUsedListings": false
  }
];
