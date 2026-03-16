// ─── Site-wide Data for College Place Apartments ───

export const SITE = {
  name: "College Place",
  tagline: "Apartments",
  logo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9eae94968_CollegeplaceIcon.png",
  heroImage: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e3b13b689_BestNearMTSUCampusApartmentsStartingfrom600StudiosOnebedroom24Bedrooms600.png",
  description:
    "Best near MTSU campus apartments in Murfreesboro, TN. Prime location, top-notch facilities, and individual leasing.",
  phone: "(615) 200-0620",
  email: "office@collegeplace.us",
  address: {
    street: "1023 Old Lascassas Rd",
    city: "Murfreesboro",
    state: "TN",
    zip: "37130",
    full: "1023 Old Lascassas Rd, Murfreesboro, TN 37130",
  },
  hours: {
    weekday: "Monday - Saturday: 9am - 5pm",
    weekend: "Sunday: Closed",
  },
  social: {
    instagram: "https://www.instagram.com/collegeplacecpl/",
    facebook: "https://www.facebook.com/collegeplacecpl/",
  },
  mapsUrl:
    "https://www.google.com/maps/place/VJ4M%2B9M+Murfreesboro,+Tennessee",
  directionsUrl:
    "https://www.google.com/maps/dir/MTSU,+Murfreesboro,+TN/VJ4M%2B9M+Murfreesboro,+Tennessee",
};

export interface Property {
  id: string;
  slug: string;
  name: string;
  address: string;
  description: string;
  beds: number;
  baths: number;
  sqft: string;
  startingPrice: number;
  image: string;
  featured?: boolean;
  tags: string[];
  floorPlans: FloorPlan[];
  amenities: string[];
  petPolicy: {
    allowed: boolean;
    deposit: number;
    monthlyRent: number;
    esaPolicy: string;
  };
  utilities: string[];
  leaseTerms: string[];
  photos: string[];
  lat: number;
  lng: number;
}

export interface FloorPlan {
  name: string;
  beds: number;
  baths: number;
  sqft: string;
  price: number;
  photoCount: number;
  has3DTour: boolean;
  photos?: string[];
}

export const PROPERTIES: Property[] = [
  {
    id: "1",
    slug: "college-place-apartments",
    name: "College Place Apartments",
    address: "1002 Old Lascassas Rd, Murfreesboro, TN 37130",
    description:
      "Experience premium student living at College Place Apartments, perfectly located near MTSU campus in Murfreesboro. Our newly constructed building offers modern amenities and flexible leasing options. Choose from various layouts including 2-bedroom units, studios, and one-bedroom apartments. Individual leasing per bedroom available.",
    beds: 2,
    baths: 2,
    sqft: "275–900",
    startingPrice: 700,
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a542d9281_CollegePlaceBirdeyeview1.png",
    featured: true,
    tags: ["Parking", "Pet-Friendly", "Individual Leasing"],
    floorPlans: [
      { name: "2 Bed / 2 Bath (per room)", beds: 2, baths: 2, sqft: "900", price: 700, photoCount: 15, has3DTour: false, photos: [
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ffac9bbeb_CollegePlaceBedroomwithcloset.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a542d9281_CollegePlaceBirdeyeview1.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5427a87ad_CollegePlaceBirdeyeview.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/55e49f238_CollegePlaceCornerroomwithroomandbathroomglimpse.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c5954ec6f_CollegePlaceeagleeyeview.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/565ad9f15_CollegePlaceEmptyroomcorner.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c074e2dca_CollegePlaceKitchen1.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/984dcf882_CollegePlaceKitchencloseup.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7f6401cdf_CollegePlaceKitchenwith2bedroom.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/637de6143_CollegePlaceKitchenwithroomview.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5aff3980f_CollegePlaceKitchenwithroom.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/dc3e67238_CollegePlaceKitchen.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/89df05664_CollegePlaceLeftSideroadsideview.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a1d476e80_CollegePlaceLeftsideDoorview.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/506200265_CollegePlaceRightsideview.png",
      ] },
      { name: "Studio", beds: 1, baths: 1, sqft: "275–350", price: 700, photoCount: 8, has3DTour: true, photos: [
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e904ea269_IMG20241226111254.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3bae19b24_IMG20241226111300.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9c9e656f9_IMG20241226111307.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/09adcbc84_IMG20241226111332.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b20e8f979_IMG20241226111410.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/09bcd8385_IMG20241226111422.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/191a72fc4_IMG20241226111432.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e904ea269_IMG20241226111254.jpg",
      ] },
      { name: "Big Studio", beds: 1, baths: 1, sqft: "300–450", price: 800, photoCount: 5, has3DTour: false, photos: [
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6860486ddd001ec9e89d86b9/88a598597_100_1224.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6860486ddd001ec9e89d86b9/4ffa643d0_100_1221.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6860486ddd001ec9e89d86b9/8a653e645_100_1216.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6860486ddd001ec9e89d86b9/cd8806cf6_100_1219.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6860486ddd001ec9e89d86b9/b02feed1b_100_1223.png",
      ] },
      { name: "One Bedroom", beds: 1, baths: 1, sqft: "400–600", price: 900, photoCount: 4, has3DTour: true, photos: [
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6860486ddd001ec9e89d86b9/17ac3fc09_100_1229.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6860486ddd001ec9e89d86b9/bfbfd1463_100_1230.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6860486ddd001ec9e89d86b9/0b8db201b_100_1232.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6860486ddd001ec9e89d86b9/72df9b220_100_1234.png",
      ] },
    ],
    amenities: [
      "Each Floor Laundry",
      "Newly Constructed Building",
      "Individual Leasing",
      "Modern Appliances",
      "High-Speed Internet",
      "Pet Friendly",
      "Volleyball Court",
    ],
    petPolicy: {
      allowed: true,
      deposit: 200,
      monthlyRent: 25,
      esaPolicy:
        "No fees or deposit required for certified Emotional Support Animals (ESA) with valid documentation.",
    },
    utilities: ["Water", "Internet", "Electricity", "Garbage Disposal"],
    leaseTerms: ["6 Months", "9 Months", "12 Months", "18 Months"],
    photos: [
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ffac9bbeb_CollegePlaceBedroomwithcloset.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a542d9281_CollegePlaceBirdeyeview1.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5427a87ad_CollegePlaceBirdeyeview.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/55e49f238_CollegePlaceCornerroomwithroomandbathroomglimpse.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c5954ec6f_CollegePlaceeagleeyeview.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/565ad9f15_CollegePlaceEmptyroomcorner.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c074e2dca_CollegePlaceKitchen1.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/984dcf882_CollegePlaceKitchencloseup.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7f6401cdf_CollegePlaceKitchenwith2bedroom.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/637de6143_CollegePlaceKitchenwithroomview.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5aff3980f_CollegePlaceKitchenwithroom.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/dc3e67238_CollegePlaceKitchen.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/89df05664_CollegePlaceLeftSideroadsideview.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a1d476e80_CollegePlaceLeftsideDoorview.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/506200265_CollegePlaceRightsideview.png",
    ],
    lat: 35.8553144,
    lng: -86.3648509,
  },
  {
    id: "2",
    slug: "college-center-apartments",
    name: "College Center Apartments",
    address: "1023 Old Lascassas Rd, Murfreesboro, TN 37130",
    description:
      "Located just 0.4 miles from MTSU campus — only an 8-minute walk or 2-minute drive to classes! Modern 4-bedroom apartments with spacious layouts and contemporary amenities.",
    beds: 4,
    baths: 4,
    sqft: "1200",
    startingPrice: 500,
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0955675c5_CollegeCenter1.jpg",
    tags: ["Parking", "Pet-Friendly", "Individual Leasing"],
    floorPlans: [
      { name: "2 Bed / 2 Bath", beds: 2, baths: 2, sqft: "900–1000", price: 550, photoCount: 3, has3DTour: false, photos: [
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0955675c5_CollegeCenter1.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6034d620b_CollegeCenter2.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2065efed4_CollegeCenter3.jpg",
      ] },
      { name: "4 Bed / 4 Bath", beds: 4, baths: 4, sqft: "1200–1400", price: 500, photoCount: 3, has3DTour: true, photos: [
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f042bbe04_CollegeCenter34.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6034d620b_CollegeCenter2.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0955675c5_CollegeCenter1.jpg",
      ] },
    ],
    amenities: [
      "Pet Friendly",
      "Volleyball Court",
      "In Property Laundry",
      "Individual Leasing",
      "Free Parking",
      "High-Speed Internet",
    ],
    petPolicy: {
      allowed: true,
      deposit: 200,
      monthlyRent: 25,
      esaPolicy:
        "No fees or deposit required for certified ESA with valid documentation.",
    },
    utilities: ["Water", "Electricity", "Internet", "Trash"],
    leaseTerms: ["6 Months", "12 Months"],
    photos: [
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0955675c5_CollegeCenter1.jpg",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6034d620b_CollegeCenter2.jpg",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2065efed4_CollegeCenter3.jpg",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/610804cc0_CollegeCenter3.jpg",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a542d9281_CollegePlaceBirdeyeview1.png",
    ],
    lat: 35.856177,
    lng: -86.3657117,
  },
  {
    id: "3",
    slug: "college-pointe-apartments",
    name: "College Pointe Apartments",
    address: "915 Brown Dr, Murfreesboro, TN 37130",
    description:
      "Modern student apartments close to MTSU campus with spacious layouts and contemporary amenities. Choose from our well-designed 2-bedroom units perfect for student living.",
    beds: 2,
    baths: 2,
    sqft: "900",
    startingPrice: 550,
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/556db2975_college-center-murfreesboro-tn-building-photo.jpg",
    tags: ["Parking", "Pet-Friendly", "Individual Leasing"],
    floorPlans: [
      { name: "2 Bed / 2 Bath", beds: 2, baths: 2, sqft: "900", price: 550, photoCount: 3, has3DTour: false, photos: [
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/556db2975_college-center-murfreesboro-tn-building-photo.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e28987513_college-center-murfreesboro-tn-living-area--shared-unit.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6626e8df8_Screenshot_31-7-2024_105220_earthgooglecom.jpg",
      ] },
    ],
    amenities: [
      "Pet Friendly",
      "Volleyball Court",
      "In Property Laundry",
      "Individual Leasing",
      "Free Parking",
      "High-Speed Internet",
    ],
    petPolicy: {
      allowed: true,
      deposit: 200,
      monthlyRent: 25,
      esaPolicy:
        "No fees or deposit required for certified ESA with valid documentation.",
    },
    utilities: ["Water", "Electricity", "Internet", "Trash"],
    leaseTerms: ["6 Months", "12 Months"],
    photos: [
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/556db2975_college-center-murfreesboro-tn-building-photo.jpg",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e28987513_college-center-murfreesboro-tn-living-area--shared-unit.jpg",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6626e8df8_Screenshot_31-7-2024_105220_earthgooglecom.jpg",
    ],
    lat: 35.8555058,
    lng: -86.3639235,
  },
  {
    id: "4",
    slug: "university-center-apartments",
    name: "University Center Apartments",
    address: "1030 Greenland Dr, Murfreesboro, TN 37130",
    description:
      "Comfortable and convenient student living at University Center Apartments. These 2-bedroom units offer spacious layouts, modern amenities, and a prime location near MTSU campus.",
    beds: 2,
    baths: 2,
    sqft: "950–1050",
    startingPrice: 600,
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3bef6ff09_Universitycenterapartments.jpg",
    tags: ["Parking", "Pet-Friendly", "Individual Leasing"],
    floorPlans: [
      { name: "2 Bed / 2 Bath", beds: 2, baths: 2, sqft: "950–1050", price: 600, photoCount: 11, has3DTour: true, photos: [
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3bef6ff09_Universitycenterapartments.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/610804cc0_CollegeCenter3.jpg",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3aad341af_2cb34d1e1486ee3817dbada46db0d963.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/715876b31_5c82ecfeaa169d011f64dc41e75c5b31.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/bfaed056e_6c96b783826467d0106704f658bfc830.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/eabdb163d_8a73d9bad140d7b80b29805abf76744b.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b50db6b02_08b75572832cc3201722804af2df62d5.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/65fb88eed_8e1e152e1dcdf9e7bc4bab841d43a12a.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/76cf425eb_9ba5289d8540840cc09700033e925909.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/630fe1a3d_72eb0c956b0efaeac8dde4b1383d83be.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f6c5cf5bb_b98e1bfe804e4e69ed898f0c27ff1ac3.png",
      ] },
    ],
    amenities: [
      "In-Unit Washer & Dryer",
      "Individual Leasing",
      "Pet Park",
      "Free Parking",
      "High-Speed Internet",
      "Modern Appliances",
    ],
    petPolicy: {
      allowed: true,
      deposit: 200,
      monthlyRent: 25,
      esaPolicy:
        "No fees or deposit required for certified ESA with valid documentation.",
    },
    utilities: ["Water", "Electricity", "Internet", "Trash"],
    leaseTerms: ["6 Months", "12 Months"],
    photos: [
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3bef6ff09_Universitycenterapartments.jpg",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/610804cc0_CollegeCenter3.jpg",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3aad341af_2cb34d1e1486ee3817dbada46db0d963.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/715876b31_5c82ecfeaa169d011f64dc41e75c5b31.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/bfaed056e_6c96b783826467d0106704f658bfc830.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/eabdb163d_8a73d9bad140d7b80b29805abf76744b.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b50db6b02_08b75572832cc3201722804af2df62d5.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/65fb88eed_8e1e152e1dcdf9e7bc4bab841d43a12a.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/76cf425eb_9ba5289d8540840cc09700033e925909.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/630fe1a3d_72eb0c956b0efaeac8dde4b1383d83be.png",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f6c5cf5bb_b98e1bfe804e4e69ed898f0c27ff1ac3.png",
    ],
    lat: 35.8544459,
    lng: -86.3724851,
  },
];

export interface FAQ {
  category: string;
  questions: { q: string; a: string }[];
}

export const FAQS: FAQ[] = [
  {
    category: "Rent & Pricing",
    questions: [
      {
        q: "How much is rent near MTSU?",
        a: "Apartments near MTSU start at $500/month for individual bedroom leasing in a 4-bedroom unit. Prices vary by floor plan, with studios, 1-bedroom, 2-bedroom options also available. Utilities are $100 per month extra per person.",
      },
      {
        q: "What utilities are included in rent?",
        a: "Utilities are $100 per month extra per person and include water, sewer, trash, high-speed internet, and cable TV. Electric and gas are the tenant's responsibility.",
      },
      {
        q: "Is there a security deposit?",
        a: "Yes, the security deposit is equivalent to one month's rent. This is refundable at the end of your lease, minus any damages beyond normal wear and tear.",
      },
      {
        q: "Do you offer individual leasing?",
        a: "Yes. Individual bedroom leasing is offered, perfect for students. You're only responsible for your bedroom's rent, not your roommates' rent.",
      },
    ],
  },
  {
    category: "Pets & Animals",
    questions: [
      {
        q: "Do you allow pets?",
        a: "Yes, we're pet-friendly! Dogs and cats are welcome. One-time non-refundable pet deposit of $200 and monthly pet rent of $25 per pet. For other animals, contact the office.",
      },
      {
        q: "What about Emotional Support Animals (ESA)?",
        a: "Certified ESAs with valid documentation are welcome with no fees or deposit required, in accordance with fair housing laws.",
      },
    ],
  },
  {
    category: "Leasing & Application",
    questions: [
      {
        q: "When can I move in?",
        a: "Move-in dates vary by unit availability. Leases start throughout the year, with most student leases beginning in August for the academic year.",
      },
      {
        q: "What lease terms do you offer?",
        a: "Flexible lease terms including 6-month, 9-month, 10-month, 12-month, and 18-month leases depending on availability.",
      },
      {
        q: "How do I apply?",
        a: "Apply online through our website. We have applications for both students and working professionals. The process takes about 15-20 minutes.",
      },
      {
        q: "What documents do I need to apply?",
        a: "Valid ID, proof of income (pay stubs or offer letter), references, and for students — proof of enrollment or acceptance letter to MTSU.",
      },
    ],
  },
  {
    category: "Tours & Viewing",
    questions: [
      {
        q: "Can I schedule a tour?",
        a: "Yes! We offer in-person tours, virtual tours, and self-guided tours. Schedule online through our booking page or by calling us.",
      },
      {
        q: "Do you offer virtual tours?",
        a: "Yes. 3D virtual tours are available for select floor plans. We also offer live virtual tours via video call for a guided experience.",
      },
    ],
  },
  {
    category: "Amenities & Features",
    questions: [
      {
        q: "What amenities are included?",
        a: "High-speed internet, laundry facilities, free parking, modern appliances, and 24/7 maintenance support. Specific amenities vary by property.",
      },
      {
        q: "Is parking included?",
        a: "Yes, free parking is included for all residents on a first-come, first-served basis.",
      },
      {
        q: "How close are you to MTSU campus?",
        a: "Approximately 0.4–1.5 miles (2–5 minute drive or 8–15 minute bike ride) depending on the property.",
      },
    ],
  },
  {
    category: "Roommates & Living",
    questions: [
      {
        q: "Can I choose my roommates?",
        a: "Yes. If you have friends who want to live together, we can accommodate that. We can also help connect you with compatible roommates.",
      },
      {
        q: "What if my roommate doesn't pay rent?",
        a: "With individual leasing, you're only responsible for your own bedroom rent, not your roommates' rent.",
      },
    ],
  },
];

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  readTime: string;
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "parents-guide-college-place-student-housing-mtsu",
    title: "What Parents Should Know About College Place Student Housing",
    category: "Parents",
    date: "Jan 5, 2025",
    excerpt:
      "A comprehensive guide for parents exploring off-campus housing options near MTSU. Learn about safety, lease terms, and what makes College Place a trusted choice.",
    readTime: "6 min read",
    content:
      "Moving your child into off-campus housing is a big step. At College Place, we understand parents want peace of mind. Our properties feature secure entry systems, 24/7 maintenance, individual leasing (so your student is only responsible for their rent), and on-site management. We're located just minutes from MTSU with well-lit parking and a welcoming community atmosphere.",
  },
  {
    slug: "murfreesboro-living-coffee-shops-study-spots-student-guide",
    title: "Murfreesboro Living: Coffee Shops, Study Spots, and Student Favorites",
    category: "Murfreesboro",
    date: "Jan 4, 2025",
    excerpt:
      "Discover the best local hangouts, coffee shops, and study spots in Murfreesboro, TN for MTSU students.",
    readTime: "5 min read",
    content:
      "Murfreesboro is packed with amazing spots for students. From the bustling coffee scene downtown to quiet study nooks near campus, there's something for everyone. Check out local favorites like Just Love Coffee, the MTSU Library, and the Greenway trails for a study break.",
  },
  {
    slug: "college-move-in-checklist-packing-guide",
    title: "Your College Move-In Checklist: What to Pack and What to Expect",
    category: "Move-In",
    date: "Jan 3, 2025",
    excerpt:
      "The ultimate packing and move-in checklist for students moving into College Place Apartments.",
    readTime: "4 min read",
    content:
      "Moving day can be stressful, but it doesn't have to be! We've put together the ultimate checklist covering everything from bedding and kitchen supplies to important documents and first-week tasks. Pro tip: move in on a weekday morning for less traffic.",
  },
  {
    slug: "top-5-reasons-students-love-college-place",
    title: "Top 5 Reasons Students Love Living at College Place",
    category: "College Place",
    date: "Jan 2, 2025",
    excerpt:
      "From the prime location to individual leasing, here's why hundreds of MTSU students choose College Place.",
    readTime: "3 min read",
    content:
      "1. Prime Location — minutes from MTSU campus. 2. Individual Leasing — only pay for your room. 3. Modern Amenities — updated appliances, high-speed internet. 4. Pet-Friendly — bring your furry friend. 5. Flexible Lease Terms — options from 6 to 18 months.",
  },
  {
    slug: "off-campus-living-mtsu-practical-guide-first-time-renters",
    title: "Off-Campus Living Near MTSU: A Practical Guide for First-Time Renters",
    category: "Off-Campus Living",
    date: "Jan 1, 2025",
    excerpt:
      "Everything first-time renters need to know about finding and securing off-campus housing near MTSU.",
    readTime: "7 min read",
    content:
      "Renting your first apartment is exciting but can feel overwhelming. This guide covers budgeting, understanding lease terms, what to look for in a rental, how to apply, and tips for a smooth move-in experience near MTSU.",
  },
  {
    slug: "ultimate-guide-off-campus-living-mtsu-students",
    title: "The Ultimate Guide to Off-Campus Living for MTSU Students",
    category: "Student Life",
    date: "Jan 1, 2025",
    excerpt:
      "Your complete resource for navigating off-campus life as an MTSU student in Murfreesboro.",
    readTime: "8 min read",
    content:
      "From choosing the right apartment to managing utilities, grocery shopping, and staying connected to campus life — this is your one-stop guide to thriving as an off-campus MTSU student.",
  },
];

export interface Testimonial {
  name: string;
  source: string;
  text: string;
  property: string;
  movedIn: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Christophe U.",
    source: "Google Reviews",
    text: "I really appreciate the high customer service, humanity, quick responsiveness, safety, and cleanliness. The management team goes above and beyond to make residents feel at home.",
    property: "College Place Apartments",
    movedIn: "8 months ago",
    rating: 5,
  },
  {
    name: "Hunter T.",
    source: "Google Reviews",
    text: "Great manager, great place to live overall. The management team is making a positive impact and creating a wonderful community for students.",
    property: "College Place Apartments",
    movedIn: "6 months ago",
    rating: 5,
  },
  {
    name: "Sarah M.",
    source: "Google Reviews",
    text: "Good place! I've enjoyed my months here. The apartments provide comfort and a welcoming living environment that makes student life so much easier.",
    property: "College Place Apartments",
    movedIn: "1 year ago",
    rating: 5,
  },
  {
    name: "Yuki K.",
    source: "Google Reviews",
    text: "This apartment was so comfortable. The living space is designed to make you feel at home with excellent facilities and friendly neighbors.",
    property: "College Place Apartments",
    movedIn: "1 year ago",
    rating: 5,
  },
  {
    name: "Takeshi R.",
    source: "Google Reviews",
    text: "It was spacious and nice. The apartment layout provides plenty of room and the facilities are well-maintained. Perfect for students!",
    property: "College Place Apartments",
    movedIn: "1 year ago",
    rating: 5,
  },
  {
    name: "Aiko N.",
    source: "Google Reviews",
    text: "Great experience at College Place Apartments. The community provides excellent service and comfortable living spaces for international students.",
    property: "College Place Apartments",
    movedIn: "1 year ago",
    rating: 5,
  },
];

export const MOVE_IN_CHECKLIST = [
  {
    title: "Before You Move (1–2 Months Out)",
    items: [
      "Complete and submit your rental application",
      "Sign your lease agreement",
      "Pay security deposit and first month's rent",
      "Set up renters insurance ($15–30/month recommended)",
      "Schedule your move-in date with the office",
      "Arrange utilities transfer (electric, gas if applicable)",
      "Update your mailing address with USPS",
      "Notify MTSU of your new address (if student)",
    ],
  },
  {
    title: "Two Weeks Before Move-In",
    items: [
      "Confirm move-in date and time with leasing office",
      "Measure your new space for furniture",
      "Order furniture and essential items",
      "Schedule movers or reserve moving truck",
      "Start packing non-essential items",
      "Transfer or set up internet service",
      "Download the College Place resident app",
      "Schedule final walkthrough inspection",
    ],
  },
  {
    title: "Moving Day Essentials",
    items: [
      "Photo ID and lease documents",
      "Keys and access cards (pick up from office)",
      "Cleaning supplies for initial setup",
      "Toilet paper, paper towels, trash bags",
      "Basic toolkit (screwdriver, hammer, etc.)",
      "Phone chargers and extension cords",
      "Snacks and water for moving day",
      "First aid kit",
    ],
  },
  {
    title: "First Week Tasks",
    items: [
      "Complete move-in inspection form",
      "Test all appliances, lights, and outlets",
      "Check water pressure and temperature",
      "Locate fire extinguisher and emergency exits",
      "Meet your neighbors and roommates",
      "Familiarize yourself with parking and amenities",
      "Set up mail forwarding if needed",
      "Take photos of your apartment condition",
    ],
  },
  {
    title: "What to Bring",
    items: [
      "Bedding (twin XL for student housing, full/queen for others)",
      "Kitchen supplies (dishes, utensils, cookware)",
      "Bathroom essentials (shower curtain, bath mat, toiletries)",
      "Cleaning supplies (vacuum, mop, cleaning products)",
      "Furniture (desk, dresser, couch — check what's provided)",
      "Personal items (clothes, decorations, electronics)",
      "School supplies (if student)",
      "Emergency contact list",
    ],
  },
];

export const NEARBY_PLACES = [
  {
    category: "Campus & Education",
    icon: "GraduationCap",
    places: [
      { name: "MTSU Campus", distance: "1.5 miles", time: "5 min drive", rating: 4.5 },
      { name: "MTSU Student Union", distance: "1.8 miles", time: "6 min drive" },
      { name: "MTSU Library", distance: "1.7 miles", time: "5 min drive" },
    ],
  },
  {
    category: "Shopping & Groceries",
    icon: "ShoppingBag",
    places: [
      { name: "Walmart Supercenter", distance: "2.1 miles", time: "7 min drive" },
      { name: "Kroger", distance: "1.9 miles", time: "6 min drive" },
      { name: "Target", distance: "3.2 miles", time: "10 min drive" },
    ],
  },
  {
    category: "Restaurants & Cafes",
    icon: "Coffee",
    places: [
      { name: "Starbucks", distance: "2.0 miles", time: "6 min drive" },
      { name: "Chick-fil-A", distance: "2.3 miles", time: "7 min drive" },
      { name: "Chipotle", distance: "2.8 miles", time: "8 min drive" },
      { name: "Panera Bread", distance: "3.1 miles", time: "9 min drive" },
    ],
  },
  {
    category: "Fitness & Recreation",
    icon: "Dumbbell",
    places: [
      { name: "Planet Fitness", distance: "3.0 miles", time: "9 min drive" },
      { name: "Anytime Fitness", distance: "2.5 miles", time: "8 min drive" },
      { name: "Greenway Park", distance: "1.2 miles", time: "4 min drive" },
    ],
  },
  {
    category: "Healthcare & Pharmacy",
    icon: "Heart",
    places: [
      { name: "Ascension Saint Thomas", distance: "4.1 miles", time: "12 min drive" },
      { name: "Urgent Care", distance: "2.8 miles", time: "8 min drive" },
      { name: "CVS Pharmacy", distance: "2.2 miles", time: "7 min drive" },
    ],
  },
];

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Floor Plans", href: "/properties" },
  { label: "3D Tour", href: "/virtual-tour" },
  { label: "Schedule Tour", href: "/schedule-tour" },
  { label: "Apply Now", href: "/apply" },
  { label: "Lease Inquiry", href: "/lease-inquiry" },
  { label: "Contact", href: "/contact" },
];

export const TENANT_LINKS = [
  { label: "Maintenance Request", href: "/maintenance" },
  { label: "Refer a Friend", href: "/referral" },
];

export const FOOTER_LINKS = {
  quickLinks: [
    { label: "Schedule Tour", href: "/schedule-tour" },
    { label: "Student Life Hub", href: "/blog" },
    { label: "FAQ", href: "/faq" },
    { label: "Location Guide", href: "/location-guide" },
    { label: "Move-In Guide", href: "/move-in-guide" },
    { label: "Student Reviews", href: "/testimonials" },
  ],
  tenant: [
    { label: "Maintenance Request", href: "/maintenance" },
    { label: "Refer a Friend", href: "/referral" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
};
