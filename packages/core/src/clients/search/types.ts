export interface SearchResponse {
  products: Product[];
  recordsFiltered: number;
  correction: Correction;
  fuzzy: string;
  operator: string;
  translated: boolean;
  pagination: Pagination;
  options: Options;
}

export interface Correction {
  misspelled: boolean;
}

export interface Options {
  sorts: any[];
  counts: any[];
  deliveryPromisesEnabled: boolean;
}

export interface Pagination {
  count: number;
  current: Current;
  before: any[];
  after: any[];
  perPage: number;
  next: First;
  previous: First;
  first: First;
  last: First;
}

export interface Current {
  index: number;
  proxyUrl: string;
}

export interface First {
  index: number;
}

export interface Product {
  cacheId: string;
  productId: string;
  description: string;
  productName: string;
  productReference: string;
  linkText: string;
  brand: string;
  brandId: number;
  link: string;
  categories: string[];
  categoryId: string;
  categoriesIds: string[];
  priceRange: PriceRange;
  specificationGroups: SpecificationGroup[];
  skuSpecifications: SkuSpecification[];
  productClusters: ClusterHighlight[];
  clusterHighlights: ClusterHighlight[];
  properties: Property[];
  items: Item[];
  releaseDate: number;
  metaTagDescription: string;
  origin: string;
  productTitle: string;
  deliveryPromisesBadges: any[];
}

export interface ClusterHighlight {
  id: string;
  name: string;
}

export interface Item {
  sellers: Seller[];
  images: Image[];
  itemId: string;
  name: string;
  nameComplete: string;
  complementName: string;
  referenceId: ReferenceID[];
  measurementUnit: string;
  unitMultiplier: number;
  variations: Variation[];
  ean: string;
  modalType: string;
  videos: any[];
  attachments: any[];
  isKit: boolean;
  attributes: any[];
  CORES?: string[];
  "Voltagem do Produto"?: string[];
}

export interface Image {
  imageId: string;
  cacheId: string;
  imageTag: string;
  imageLabel: ImageLabelEnum;
  imageText: ImageLabelEnum;
  imageUrl: string;
}

export enum ImageLabelEnum {
  Empty = "",
  The0_Image = "0_image",
  The1_Image = "1_image",
  The2_Image = "2_image",
  The3_Image = "3_image",
  The4_Image = "4_image",
}

export interface ReferenceID {
  Key: string;
  Value: string;
}

export interface Seller {
  sellerId: string;
  sellerName: string;
  addToCartLink: string;
  sellerDefault: boolean;
  commertialOffer: CommertialOffer;
}

export interface CommertialOffer {
  DeliverySlaSamplesPerRegion: DeliverySlaSamplesPerRegion;
  DeliverySlaSamples: any[];
  AvailableQuantity: number;
  discountHighlights: any[];
  Installments: Installment[];
  Price: number;
  ListPrice: number;
  spotPrice: number;
  taxPercentage: number | null;
  PriceWithoutDiscount: number;
  Tax: number;
  GiftSkuIds: any[];
  BuyTogether: any[];
  ItemMetadataAttachment: any[];
  RewardValue: number;
  PriceValidUntil: Date | null;
  GetInfoErrorMessage: null;
  CacheVersionUsedToCallCheckout: string;
  teasers: Teaser[];
}

export interface DeliverySlaSamplesPerRegion {}

export interface Installment {
  Value: number;
  InterestRate: number;
  TotalValuePlusInterestRate: number;
  NumberOfInstallments: number;
  PaymentSystemName: PaymentSystemName;
  PaymentSystemGroupName: PaymentSystemGroupName;
  Name: string;
}

export enum PaymentSystemGroupName {
  CreditCardPaymentGroup = "creditCardPaymentGroup",
  Custom210PaymentGroupPaymentGroup = "custom210PaymentGroupPaymentGroup",
  CustomPrivate401PaymentGroup = "customPrivate_401PaymentGroup",
  GiftCardPaymentGroup = "giftCardPaymentGroup",
  InstantPaymentPaymentGroup = "instantPaymentPaymentGroup",
}

export enum PaymentSystemName {
  AmericanExpress = "American Express",
  Diners = "Diners",
  Elo = "Elo",
  FastPayPlatinum = "Fast Pay Platinum",
  Hipercard = "Hipercard",
  Mastercard = "Mastercard",
  OutrosPagamentosAPPVendedor12XSJuros = "Outros Pagamentos APP Vendedor (12x - s/ juros)",
  Pix = "Pix",
  Vale = "Vale",
  Visa = "Visa",
}

export interface Teaser {
  name: string;
  conditions: Conditions;
  effects: Effects;
  generalValues: any[];
}

export interface Conditions {
  parameters: Parameter[];
  minimumQuantity: number;
}

export interface Parameter {
  name: string;
  value: string;
}

export interface Effects {
  parameters: Parameter[];
}

export interface Variation {
  name: string;
  values: string[];
}

export interface PriceRange {
  sellingPrice: Price;
  listPrice: Price;
}

export interface Price {
  highPrice: number;
  lowPrice: number;
}

export interface Property {
  name: string;
  originalName: string;
  values: string[];
}

export interface SkuSpecification {
  field: Field;
  values: Field[];
}

export interface Field {
  name: string;
  originalName: string;
}

export interface SpecificationGroup {
  originalName: string;
  name: string;
  specifications: Property[];
}
