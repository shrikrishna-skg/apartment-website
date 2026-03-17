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
  matterportId?: string;
  matterportTours?: { id: string; label: string }[];
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
    matterportId: "RsoupLY68y4",
    matterportTours: [
      { id: "RsoupLY68y4", label: "1 Bedroom" },
      { id: "19FrAE6LcKs", label: "2 Bedroom" },
      { id: "MiqAALNUxjg", label: "2 Bed / 2 Bath" },
      { id: "7p3t4qWMZe4", label: "Studio" },
    ],
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
    matterportId: "79gLjrXJuqu",
    matterportTours: [
      { id: "79gLjrXJuqu", label: "4 Bed / 4 Bath" },
    ],
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
  image: string;
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "off-campus-housing-near-mtsu-complete-guide",
    title: "Off-Campus Housing Near MTSU: The Complete Guide for 2025-2026",
    category: "Housing Guide",
    date: "Mar 10, 2025",
    excerpt:
      "Everything you need to know about finding the perfect off-campus apartment near Middle Tennessee State University — from pricing and locations to lease tips and what to look for.",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    content: `<p>Finding off-campus housing near MTSU doesn't have to be stressful. Whether you're a freshman moving off campus for the first time or a senior looking for a better deal, this guide covers everything you need to know about student apartments in Murfreesboro, TN.</p>

<h2>Why Students Choose Off-Campus Housing</h2>
<p>More than 70% of MTSU students live off campus — and for good reason. Off-campus apartments near MTSU typically offer more space, more privacy, and lower per-month costs than on-campus dorms, especially when you factor in the mandatory meal plan that comes with dorm living.</p>
<p>At College Place, studios start at just <strong>$600/month</strong> with all the freedom of your own apartment. Compare that to MTSU dorm rates plus a required meal plan, and the savings add up fast.</p>

<h2>What to Look for in Student Housing</h2>
<p>When comparing apartments near MTSU, here's what matters most to students:</p>
<ul>
<li><strong>Distance to campus</strong> — College Place is just a 3-minute drive or 12-minute bike ride from MTSU's main campus</li>
<li><strong>Individual leasing</strong> — You're only responsible for your own rent, not your roommate's. This is huge for peace of mind.</li>
<li><strong>Included amenities</strong> — Look for places that include internet, parking, and basic utilities to avoid surprise bills</li>
<li><strong>Pet policy</strong> — If you have a furry friend, make sure the complex is pet-friendly before you sign</li>
<li><strong>Maintenance response time</strong> — 24/7 maintenance isn't just a perk, it's a necessity. Ask current residents how fast issues get fixed.</li>
</ul>

<h2>Average Rent Near MTSU</h2>
<p>Here's what you can expect to pay for student housing in the Murfreesboro area:</p>
<ul>
<li><strong>Studio:</strong> $600 – $750/month</li>
<li><strong>1-Bedroom:</strong> $700 – $900/month</li>
<li><strong>2-Bedroom (per person):</strong> $500 – $700/month</li>
<li><strong>4-Bedroom (per person):</strong> $450 – $600/month</li>
</ul>
<p>Pro tip: Tennessee has <strong>no state income tax</strong>, which means your part-time job earnings go further here than in most other states.</p>

<h2>When to Start Your Search</h2>
<p>The best apartments near MTSU fill up fast. Here's a general timeline:</p>
<ul>
<li><strong>October – December:</strong> Start researching and touring properties for the following fall</li>
<li><strong>January – March:</strong> Peak leasing season. The best units get signed during this window.</li>
<li><strong>April – June:</strong> Limited availability. You may still find options, but choices narrow quickly.</li>
<li><strong>July – August:</strong> Last-minute options only. Don't wait this long if you can help it.</li>
</ul>

<h2>Schedule a Tour</h2>
<p>The best way to find your next home is to see it in person. Schedule a tour at College Place to walk through our floor plans, meet our team, and see why hundreds of MTSU students choose us every year.</p>`,
  },
  {
    slug: "mtsu-dorms-vs-off-campus-apartments",
    title: "MTSU Dorms vs. Off-Campus Apartments: Which Is Right for You?",
    category: "Comparison",
    date: "Mar 5, 2025",
    excerpt:
      "A side-by-side comparison of living on campus vs. off campus at MTSU. We break down costs, space, freedom, and social life to help you decide.",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
    content: `<p>One of the biggest decisions MTSU students face is whether to live in a dorm or move into an off-campus apartment. Both have pros and cons — here's an honest breakdown to help you decide.</p>

<h2>Cost Comparison</h2>
<p>Let's look at the real numbers. MTSU dorm rates for 2024-2025 range from about $3,200 to $4,500 per semester for a shared room. Add the mandatory meal plan ($1,800 – $2,400/semester), and you're looking at <strong>$10,000 – $13,800 per academic year</strong> for on-campus living.</p>
<p>Off-campus? A shared 2-bedroom at College Place runs about $600/person per month. Over 12 months, that's <strong>$7,200/year</strong> — and you keep your place over summer. Even adding groceries ($250/month) and utilities, you'll likely spend less overall.</p>

<h2>Space and Privacy</h2>
<p>Dorm rooms average about 150-200 square feet shared with a roommate. That's barely enough for two beds, two desks, and your stuff. Off-campus apartments give you a full kitchen, living room, your own bedroom, and often your own bathroom. The difference in quality of life is massive.</p>

<h2>Freedom and Independence</h2>
<p>Dorms come with rules — quiet hours, guest policies, RA check-ins, and no cooking beyond a microwave. Off-campus living means you set your own rules. Cook real meals, have friends over whenever, and live on your own schedule.</p>

<h2>Social Life</h2>
<p>This is where dorms have a genuine advantage, especially for freshmen. The built-in social environment of a dorm floor makes it easy to meet people during your first year. However, by sophomore year, most students have established friend groups and actually prefer the social flexibility of off-campus living — hosting game nights, study groups, or dinners at your own place.</p>

<h2>The Commute Factor</h2>
<p>Some students worry about being "too far" from campus. But most off-campus apartments near MTSU are a 5-10 minute drive. College Place is located on Old Lascassas Road, just minutes from campus. Many students bike or use the Raider Xpress shuttle.</p>

<h2>Our Recommendation</h2>
<p>If you're an incoming freshman who doesn't know anyone at MTSU, dorms can be a great first-year experience. After that? Off-campus living gives you more space, more freedom, and usually saves you money. It's no surprise that the vast majority of MTSU students make the switch by sophomore year.</p>`,
  },
  {
    slug: "first-apartment-checklist-mtsu-students",
    title: "First Apartment Checklist: Everything MTSU Students Need",
    category: "Move-In",
    date: "Feb 28, 2025",
    excerpt:
      "Moving into your first apartment? Don't forget anything with our comprehensive checklist — from kitchen essentials to the documents you'll need on move-in day.",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    content: `<p>Moving into your first apartment is one of the most exciting milestones of college life. But it can also feel overwhelming trying to figure out what you actually need. Here's a practical, no-fluff checklist from students who've done it before.</p>

<h2>Kitchen Essentials</h2>
<ul>
<li>Set of pots and pans (a 10-piece starter set is plenty)</li>
<li>Cooking utensils — spatula, wooden spoon, tongs, can opener</li>
<li>Plates, bowls, cups, and silverware for at least 4 people</li>
<li>Chef's knife and cutting board</li>
<li>Dish soap, sponges, and a drying rack</li>
<li>Trash bags and paper towels</li>
<li>Basic pantry staples — salt, pepper, oil, pasta, rice</li>
</ul>
<p><strong>Pro tip:</strong> Hit up Aldi on Memorial Blvd in Murfreesboro for affordable groceries. Walmart and Kroger are also nearby.</p>

<h2>Bedroom Must-Haves</h2>
<ul>
<li>Bedding set (sheets, comforter, pillows) — check your mattress size first!</li>
<li>Hangers and closet organizers</li>
<li>Desk lamp for late-night studying</li>
<li>Power strip with surge protector</li>
<li>A small fan or white noise machine for better sleep</li>
</ul>

<h2>Bathroom Basics</h2>
<ul>
<li>Towels (at least 2 bath towels and 2 hand towels)</li>
<li>Shower curtain and rings (most apartments don't provide these)</li>
<li>Toiletries — shampoo, body wash, toothpaste</li>
<li>First aid kit</li>
<li>Plunger (trust us, you'll need one eventually)</li>
</ul>

<h2>Important Documents</h2>
<ul>
<li>Signed lease agreement</li>
<li>Renter's insurance policy (many complexes require this — it's usually just $10-15/month)</li>
<li>Photo ID and MTSU student ID</li>
<li>Move-in condition checklist (take photos of everything on day one!)</li>
</ul>

<h2>Move-In Day Tips</h2>
<ul>
<li><strong>Move in on a weekday</strong> if possible — way less traffic in the parking lot</li>
<li><strong>Arrive early</strong> to beat the heat (Tennessee summers are no joke)</li>
<li><strong>Bring a toolkit</strong> — screwdriver, hammer, picture hooks, measuring tape</li>
<li><strong>Photograph everything</strong> before you unpack — document any existing damage to protect your security deposit</li>
<li><strong>Meet your neighbors</strong> — a quick hello goes a long way</li>
</ul>`,
  },
  {
    slug: "parents-guide-off-campus-housing-mtsu",
    title: "A Parent's Guide to Off-Campus Housing Near MTSU",
    category: "Parents",
    date: "Feb 20, 2025",
    excerpt:
      "Your child is moving off campus — here's everything parents need to know about safety, costs, lease co-signing, and how to evaluate student housing in Murfreesboro.",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
    content: `<p>Your child is ready to move off campus. Whether you're excited for them or slightly terrified, this guide will help you feel confident about the process — from evaluating properties to understanding what you're signing.</p>

<h2>Is Murfreesboro Safe?</h2>
<p>This is usually the first question parents ask, and it's a fair one. Murfreesboro is the largest suburb of Nashville with a population of about 165,000. The city's crime rate has been <strong>declining year over year</strong>, and the neighborhoods around MTSU (particularly along Old Lascassas Road where College Place is located) are well-established residential areas with good lighting and regular police presence.</p>
<p>MTSU also has its own 24-hour campus police department, and the Clery Act requires the university to publish annual campus crime statistics, which you can review online.</p>

<h2>Understanding the Lease</h2>
<p>Student housing leases work differently from typical apartment leases. Here's what to know:</p>
<ul>
<li><strong>Individual leasing</strong> means your student is only responsible for their own bedroom's rent — not their roommate's. If a roommate moves out or stops paying, your student isn't on the hook. This is the #1 thing parents should look for.</li>
<li><strong>Lease terms</strong> typically run August to July (12 months), aligning with the academic year</li>
<li><strong>Co-signing:</strong> Most students need a parent or guardian to co-sign. This means you're financially responsible if your student doesn't pay rent. Review the terms carefully.</li>
<li><strong>Security deposits</strong> are usually one month's rent and are refundable if the apartment is returned in good condition</li>
</ul>

<h2>What to Look for on a Tour</h2>
<p>If you can visit in person (or your student is touring on your behalf), here's a checklist:</p>
<ul>
<li>Check water pressure, faucets, and flush all toilets</li>
<li>Open and close all windows and doors — do they stick?</li>
<li>Look for signs of pests (check under sinks, in corners)</li>
<li>Ask about average maintenance response time</li>
<li>Check cell phone signal strength inside the unit</li>
<li>Visit the parking lot at night — is it well-lit?</li>
<li>Talk to current residents if possible</li>
</ul>

<h2>Questions Every Parent Should Ask</h2>
<ul>
<li>What's included in the rent? (utilities, internet, parking)</li>
<li>Is there 24/7 emergency maintenance?</li>
<li>What's the guest policy?</li>
<li>How is mail and package delivery handled?</li>
<li>What happens if my student needs to break the lease early?</li>
</ul>

<h2>Cost Breakdown</h2>
<p>Here's a realistic monthly budget for a student living off-campus near MTSU:</p>
<ul>
<li><strong>Rent:</strong> $600 – $900/month (depending on unit size)</li>
<li><strong>Utilities:</strong> Often included, or $100-150/month if not</li>
<li><strong>Groceries:</strong> $250 – $350/month</li>
<li><strong>Renter's Insurance:</strong> $10 – $20/month</li>
<li><strong>Transportation:</strong> $50 – $100/month (gas, or free with MTSU shuttle)</li>
</ul>
<p>Remember: Tennessee has <strong>no state income tax</strong>, so any part-time job earnings stretch further here than in most states.</p>`,
  },
  {
    slug: "best-coffee-shops-study-spots-near-mtsu",
    title: "Best Coffee Shops and Study Spots Near MTSU",
    category: "Murfreesboro",
    date: "Feb 15, 2025",
    excerpt:
      "From cozy cafés to quiet library corners, here are the best places MTSU students go to study, caffeinate, and get work done in Murfreesboro.",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
    content: `<p>Every student needs a go-to study spot. Whether you need dead silence or background buzz, Murfreesboro has you covered. Here are the spots MTSU students swear by.</p>

<h2>Coffee Shops</h2>

<h3>Just Love Coffee Café</h3>
<p>Located on Medical Center Parkway, Just Love is a student staple. Great lattes, solid WiFi, and enough outlets to keep your laptop alive through a 4-hour study session. Their breakfast menu is also surprisingly good for a coffee shop. <strong>Best for:</strong> Morning study sessions and group projects.</p>

<h3>Brass Horn Coffee Roasters</h3>
<p>A locally-owned gem on East Main Street. They roast their own beans in-house, and you can taste the difference. The atmosphere is chill and unpretentious — perfect for getting into a flow state. <strong>Best for:</strong> Solo deep-focus work.</p>

<h3>Red Bicycle Coffee</h3>
<p>Part of a small Tennessee chain, Red Bicycle brings Nashville coffee culture to Murfreesboro. Their cold brew is legendary, and the space is bright and airy. <strong>Best for:</strong> Afternoon pick-me-ups between classes.</p>

<h3>Coffee Fusion</h3>
<p>This spot doubles as a Vietnamese restaurant, so you can get a bánh mì and a pour-over in the same order. The vibe is eclectic and the prices are student-friendly. <strong>Best for:</strong> When you need food and caffeine in one stop.</p>

<h2>On-Campus Study Spots</h2>

<h3>James E. Walker Library</h3>
<p>MTSU's main library has four floors of study space, from silent individual desks to group collaboration rooms you can reserve online. The Starbucks on the first floor doesn't hurt either. <strong>Best for:</strong> Finals week marathon sessions.</p>

<h3>Student Union Building</h3>
<p>More casual than the library, the Student Union has comfy seating areas, food options, and a social energy that some students find motivating. <strong>Best for:</strong> Light reading and casual study between classes.</p>

<h2>Outdoor Study Spots</h2>
<p>When the weather cooperates (and in Tennessee, it often does), take your textbooks outside:</p>
<ul>
<li><strong>MTSU Quad</strong> — the classic campus lawn experience</li>
<li><strong>Greenway Trails</strong> — benches along the path for a change of scenery</li>
<li><strong>Barfield Crescent Park</strong> — a 275-acre park with picnic tables and peace and quiet, just 10 minutes from campus</li>
</ul>

<h2>Study Tip</h2>
<p>Rotate your study locations. Research shows that changing your environment can actually improve memory retention. Keep 3-4 spots in your rotation and switch it up throughout the week.</p>`,
  },
  {
    slug: "how-to-budget-first-apartment-mtsu",
    title: "How to Budget for Your First Apartment Near MTSU",
    category: "Student Life",
    date: "Feb 10, 2025",
    excerpt:
      "Rent, groceries, utilities, and fun money — here's a realistic monthly budget breakdown for MTSU students living off campus in Murfreesboro.",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    content: `<p>Moving off campus means managing your own money for the first time. The good news? Murfreesboro's cost of living is about <strong>7% below the national average</strong>, and housing costs are 14% lower than the U.S. average. Here's how to build a realistic budget.</p>

<h2>The Monthly Breakdown</h2>
<p>Here's what a typical MTSU student's monthly expenses look like living off-campus:</p>

<h3>Fixed Costs</h3>
<ul>
<li><strong>Rent:</strong> $600/month (studio at College Place) to $900/month (1BR)</li>
<li><strong>Renter's Insurance:</strong> $12 – $18/month (required by most complexes, and worth it)</li>
<li><strong>Phone:</strong> $40 – $80/month</li>
</ul>

<h3>Variable Costs</h3>
<ul>
<li><strong>Groceries:</strong> $250 – $350/month</li>
<li><strong>Gas/Transportation:</strong> $50 – $100/month</li>
<li><strong>Personal/Entertainment:</strong> $100 – $200/month</li>
<li><strong>Dining Out:</strong> $50 – $150/month</li>
</ul>

<h3>Total: $1,100 – $1,900/month</h3>
<p>That might sound like a lot, but remember — MTSU dorms plus a meal plan cost roughly $1,150 – $1,500/month when you break it down. Off-campus living is often comparable or cheaper, and you get way more for your money.</p>

<h2>Money-Saving Tips</h2>
<ul>
<li><strong>Cook at home.</strong> Seriously. Eating out 3x/week adds up to $200+ per month easily. Learn 5-6 simple meals and rotate them.</li>
<li><strong>Shop at Aldi.</strong> The Aldi on Memorial Blvd saves most students 30-40% compared to Kroger on the same grocery list.</li>
<li><strong>Use your MTSU student ID.</strong> You'd be surprised how many local businesses offer student discounts — restaurants, movie theaters, even some clothing stores.</li>
<li><strong>Split streaming services.</strong> Netflix, Spotify, and other subscriptions add up. Share accounts with roommates.</li>
<li><strong>Take advantage of free campus resources.</strong> MTSU's Campus Rec center is included in your tuition. That's a free gym membership.</li>
</ul>

<h2>Part-Time Job Options</h2>
<p>To cover your expenses, most students work 15-20 hours per week. Good options near MTSU:</p>
<ul>
<li><strong>On-campus jobs</strong> through MTSU's Student Employment — flexible hours that work around your classes</li>
<li><strong>Retail on Memorial Blvd</strong> — Target, Best Buy, and dozens of restaurants are always hiring</li>
<li><strong>Tutoring</strong> — pays better than retail and reinforces what you're learning</li>
<li><strong>Freelancing</strong> — if you have skills in writing, design, or coding, platforms like Upwork and Fiverr can bring in extra income on your own schedule</li>
</ul>

<h2>The 50/30/20 Rule</h2>
<p>A simple framework: put <strong>50% of your income toward needs</strong> (rent, groceries, insurance), <strong>30% toward wants</strong> (dining out, entertainment, clothes), and <strong>20% toward savings or debt</strong>. Even saving $50/month builds a safety net that future-you will be grateful for.</p>`,
  },
  {
    slug: "things-to-do-murfreesboro-tn-mtsu-students",
    title: "Things to Do in Murfreesboro TN: The MTSU Student's Bucket List",
    category: "Murfreesboro",
    date: "Feb 1, 2025",
    excerpt:
      "New to Murfreesboro? Here's everything MTSU students love about this city — from local eats and nightlife to outdoor adventures and Nashville day trips.",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1596522354195-e84ae3c98731?w=800&q=80",
    content: `<p>Murfreesboro might not be Nashville, but that's actually part of its charm. You get small-city affordability with big-city access (Nashville is just 35 miles up I-24). Here's your bucket list for making the most of student life here.</p>

<h2>Food Worth Finding</h2>
<ul>
<li><strong>Slick Pig BBQ</strong> — Some of the best pulled pork in Middle Tennessee. Cash only, so hit the ATM first.</li>
<li><strong>The Boulevard Bar & Grille</strong> — Right off campus. Great burgers and a solid trivia night.</li>
<li><strong>La Siesta</strong> — Authentic Mexican food at student-friendly prices. Their lunch specials are a steal.</li>
<li><strong>Demo's Steak & Spaghetti</strong> — A Murfreesboro institution since 1989. The portions are enormous.</li>
<li><strong>Hattie Jane's Creamery</strong> — Artisan ice cream on the downtown square. Try the salted caramel.</li>
<li><strong>Donut Country</strong> — When you need a study break at 11pm. Open late and always worth the stop.</li>
</ul>

<h2>Outdoor Adventures</h2>
<ul>
<li><strong>Barfield Crescent Park</strong> — 275 acres with hiking trails, disc golf, mountain biking, and a wilderness station. It's free and stunning in the fall.</li>
<li><strong>Stones River Greenway</strong> — 17+ miles of paved trails connecting parks across the city. Perfect for running, biking, or just clearing your head.</li>
<li><strong>Percy Priest Lake</strong> — 20 minutes from campus. Bring a kayak, go swimming, or just hang out on the rocks.</li>
<li><strong>Stones River National Battlefield</strong> — A Civil War site with beautiful walking trails. Peaceful, free, and a good reminder that there's more to life than exams.</li>
</ul>

<h2>Entertainment and Nightlife</h2>
<ul>
<li><strong>Hop Springs</strong> — A brewery, distillery, and event venue with live music. Great for weekend hangouts.</li>
<li><strong>Lanes, Trains, and Automobiles</strong> — Bowling, arcade games, and laser tag. Group date night central.</li>
<li><strong>MTSU Campus Events</strong> — Free concerts, movie screenings, and events through SPARE (Student Programming and Raider Entertainment)</li>
<li><strong>Downtown Murfreesboro Square</strong> — Local shops, restaurants, and seasonal events. The Saturday farmers market is a gem.</li>
</ul>

<h2>Nashville Day Trips</h2>
<p>Nashville is only 40 minutes up I-24. Here's what to do when you need a big-city fix:</p>
<ul>
<li><strong>Broadway</strong> — The honky-tonk strip. Go at least once, even if country music isn't your thing.</li>
<li><strong>Nashville Hot Chicken</strong> — Prince's (the original), Hattie B's, or Bolton's. You'll need milk.</li>
<li><strong>Centennial Park</strong> — A full-scale replica of the Greek Parthenon. Yes, really. Free to walk around.</li>
<li><strong>East Nashville</strong> — Coffee shops, vintage stores, and some of the best restaurants in the city.</li>
</ul>

<h2>The Best of Both Worlds</h2>
<p>That's the real selling point of living in Murfreesboro as an MTSU student — you get affordable rent, a tight-knit college-town feel, and Nashville is right there whenever you want it. It's the best of both worlds.</p>`,
  },
  {
    slug: "how-to-find-roommate-mtsu",
    title: "How to Find a Roommate at MTSU (And Not Regret It)",
    category: "Student Life",
    date: "Jan 25, 2025",
    excerpt:
      "Finding the right roommate can make or break your off-campus experience. Here's how MTSU students find compatible roommates — and set ground rules that actually work.",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    content: `<p>A great roommate makes your apartment feel like home. A bad one makes it feel like a war zone. Here's how to find someone compatible — and set expectations early so you stay friends all year.</p>

<h2>Where to Find Roommates</h2>
<ul>
<li><strong>MTSU Off-Campus Housing Portal</strong> — The university's official roommate matching tool at offcampushousing.mtsu.edu. Free for all students.</li>
<li><strong>Facebook Groups</strong> — Search for "MTSU Roommate Finder" or "MTSU Class of [Year]" groups. Most active from January through May.</li>
<li><strong>Friends of Friends</strong> — Ask around. Your ideal roommate might be one mutual connection away.</li>
<li><strong>Your Housing Community</strong> — At College Place, our team can help connect students looking for roommates in the same floor plan.</li>
</ul>

<h2>Questions to Ask Before Committing</h2>
<p>Before you agree to share a lease, have an honest conversation about these topics:</p>
<ul>
<li><strong>Sleep schedule</strong> — Are you a night owl rooming with an early bird? That's a recipe for conflict.</li>
<li><strong>Cleanliness standards</strong> — "Clean" means different things to different people. Be specific.</li>
<li><strong>Guests and significant others</strong> — How often? Overnight? This is the #1 source of roommate conflict.</li>
<li><strong>Noise and study habits</strong> — Do you need silence to focus, or can you work with background noise?</li>
<li><strong>Pets</strong> — Allergies, preferences, and who's responsible for pet care</li>
<li><strong>Shared expenses</strong> — How will you split groceries, cleaning supplies, and shared items?</li>
</ul>

<h2>The Roommate Agreement</h2>
<p>It might feel awkward, but writing down a simple roommate agreement prevents 90% of conflicts. Cover these basics:</p>
<ul>
<li>Cleaning schedule (who does what, and when)</li>
<li>Quiet hours</li>
<li>Guest policies</li>
<li>How to handle disagreements (talk first, don't let things fester)</li>
<li>Shared vs. personal items in common areas</li>
</ul>
<p>Keep it simple and revisit it after the first month to adjust anything that isn't working.</p>

<h2>Red Flags to Watch For</h2>
<ul>
<li>They can't keep a stable living situation (moved 3 times last year? Ask why.)</li>
<li>They're vague about their financial situation or employment</li>
<li>They dismiss your concerns or boundaries during the initial conversation</li>
<li>They badmouth every previous roommate they've ever had</li>
</ul>

<h2>Individual Leasing: Your Safety Net</h2>
<p>Here's the biggest reason to choose a complex with individual leasing: if your roommate situation goes south, you're not financially responsible for their rent. At College Place, each resident signs their own lease. Your roommate's problems don't become your problems — at least not financially.</p>`,
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
  { label: "Floor Plans", href: "/properties" },
  { label: "3D Tour", href: "/virtual-tour" },
  { label: "Schedule Tour", href: "/schedule-tour" },
  { label: "Contact", href: "/contact" },
  { label: "Apply Now", href: "/apply" },
];

export const TENANT_LINKS = [
  { label: "Maintenance Request", href: "/maintenance" },
  { label: "Refer a Friend", href: "/referral" },
];

export const FOOTER_LINKS = {
  quickLinks: [
    { label: "Schedule Tour", href: "/schedule-tour" },
    { label: "Lease Inquiry", href: "/lease-inquiry" },
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
