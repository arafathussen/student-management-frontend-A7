export type Role = "SUPER_ADMIN" | "ADMIN" | "COUNSELOR" | "STUDENT";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED" | "DELETED";
export type UniversityPaymentType = "FREE" | "UPFRONT_FEE" | "OFFER_DEPOSIT" | "DEPOSIT_REQUIRED";
export type ApplicationStatus =
	| "DRAFT"
	| "SUBMITTED"
	| "DOCS_PENDING"
	| "DOCUMENTS_UNDER_REVIEW"
	| "UNDER_REVIEW"
	| "PROCESSING"
	| "OFFER_ISSUED"
	| "OFFER_LETTER_ISSUED"
	| "VISA_PROCESSING"
	| "ACCEPTED"
	| "ENROLLED"
	| "REJECTED";
export type DocumentStatus = "REQUIRED" | "UPLOADED" | "VERIFIED" | "REJECTED" | "PENDING";
export type CommissionStatus = "PENDING" | "APPROVED" | "WITHDRAWN";
export type CommissionVisibilityMode = "FULL_BREAKDOWN" | "NET_ONLY" | "HIDDEN";
export type ChatMode = "EXCLUSIVE_LOCK" | "COLLABORATIVE_GROUP";

export interface IUser {
	id: string;
	name: string;
	email: string;
	role: Role;
	status?: UserStatus;
	imageUrl?: string;
	contactNumber?: string;
	contactNo?: string;
	isEmailVerified?: boolean;
	student?: IStudent;
	counselor?: ICounselor;
	commissionVisibility?: CommissionVisibilityMode;
	createdAt?: string;
	updatedAt?: string;
}

export interface IStudent {
	id: string;
	userId?: string;
	studentId?: string;
	name?: string;
	email?: string;
	contactNumber?: string;
	contactNo?: string;
	address?: string;
	gender?: string;
	accessScope?: string;
	targetBudget?: number;
	preferredCurrency?: string;
	user?: IUser;
}

export interface ICounselor {
	id: string;
	userId?: string;
	counselorId?: string;
	name?: string;
	email?: string;
	designation?: string;
	specialization?: string;
	contactNumber?: string;
	commissionVisibilityMode?: CommissionVisibilityMode;
	defaultVatPercentage?: number;
	defaultCompanySharePercentage?: number;
	user?: IUser;
}

export interface ICountry {
	id: string;
	name: string;
	code: string;
	currency: string;
	description?: string;
	flagUrl?: string;
	universities?: IGlobalUniversity[];
}

export interface IGlobalUniversity {
	id: string;
	name: string;
	city: string;
	countryId?: string;
	country?: ICountry;
	website?: string;
	logoUrl?: string;
	bannerUrl?: string;
	coverImageUrl?: string;
	description?: string;
	paymentType?: UniversityPaymentType;
	offerLetterPaymentType?: string;
	applicationFee?: number;
	offerDepositFee?: number;
	minTuitionFee?: number;
	maxTuitionFee?: number;
	worldRanking?: number;
	status?: "PUBLISHED" | "DRAFT" | "DELETED";
	isDraft?: boolean;
	isDeleted?: boolean;
	tags?: string[];
	docRequirements?: any[];
	programs?: IGlobalProgram[];
}

export interface IUniversityDocRequirement {
	id: string;
	universityId?: string;
	documentName?: string;
	title?: string;
	description?: string;
	isRequired?: boolean;
	docType?: string;
	formatAllowed?: string;
}

export interface IGlobalProgram {
	id: string;
	universityId?: string;
	university?: IGlobalUniversity;
	name?: string;
	title?: string;
	degreeLevel?: string;
	level?: string;
	durationYears?: number;
	duration?: string;
	tuitionFee?: number;
	initialDeposit?: number;
	intakeSeason?: string;
	intake?: string;
	ieltsRequirement?: number;
	academicRequirement?: string;
}

export interface IHigherStudyApplication {
	id: string;
	applicationNumber?: string;
	studentId?: string;
	student?: any;
	programId?: string;
	program?: any;
	counselorId?: string;
	counselor?: any;
	status: ApplicationStatus | string;
	isFeePaid?: boolean;
	isOfferUnlocked: boolean;
	offerLetterUrl?: string;
	offerIssuedAt?: string;
	documents?: any[];
	payments?: any[];
	counselorNotes?: any[];
	notes?: any[];
	internalNotes?: any[];
	createdAt?: string;
}

export interface IApplicationDocument {
	id: string;
	applicationId?: string;
	documentName?: string;
	title?: string;
	instruction?: string;
	fileUrl?: string;
	status: DocumentStatus | string;
	isRequired?: boolean;
	isCustom?: boolean;
	adminFeedback?: string;
	createdAt?: string;
}

export interface ICounselorNote {
	id: string;
	authorName?: string;
	authorRole?: Role;
	note: string;
	isPrivate: boolean;
	counselor?: any;
	createdAt: string;
}

export interface IChatRoom {
	id: string;
	applicationId?: string;
	studentUserId?: string;
	mode?: ChatMode;
	isLocked?: boolean;
	lockedByAgentId?: string | null;
	lockedByAgentName?: string | null;
	messages?: IChatMessage[];
}

export interface IChatMessage {
	id: string;
	roomId?: string;
	message: string;
	attachmentUrl?: string;
	senderDisplayName?: string;
	senderRoleBadge?: string;
	senderId: string;
	sender?: {
		id: string;
		name: string;
		role: Role;
		imageUrl?: string;
	};
	createdAt: string;
}

export interface IAgencyCommission {
	id: string;
	studentId?: string;
	student?: any;
	applicationId?: string;
	application?: any;
	counselorId?: string;
	counselor?: any;
	referredByUserId?: string;
	referredByUser?: IUser;
	universityName?: string;
	grossAmountUSD?: number;
	grossCommissionAmount?: number;
	currency?: string;
	taxPercent?: number;
	vatPercent?: number;
	vatAmount?: number;
	companySharePercent?: number;
	companyShareAmount?: number;
	counselorSharePercent?: number;
	counselorShareBDT?: number;
	netPayableAmount?: number;
	usdToBdtRate?: number;
	exchangeRateToBDT?: number;
	netPayableBDT?: number;
	status?: CommissionStatus;
	withdrawalStatus?: string;
	withdrawnAt?: string;
	createdAt?: string;
}

export interface IBlogPost {
	id: string;
	title: string;
	slug: string;
	content: string;
	excerpt?: string;
	bannerUrl?: string;
	coverImage?: string;
	category?: string;
	readTime?: string;
	status?: "PUBLISHED" | "DRAFT" | "TRASH";
	isPublished?: boolean;
	isDeleted?: boolean;
	tags?: string[];
	authorId?: string;
	author?: IUser;
	createdAt?: string;
	updatedAt?: string;
}

// Convenient Aliases for Frontend components
export type User = IUser;
export type Country = ICountry;
export type University = IGlobalUniversity;
export type Program = IGlobalProgram;
export type Application = IHigherStudyApplication;
export type ApplicationDocument = IApplicationDocument;
export type CommissionRecord = IAgencyCommission;
export type Blog = IBlogPost;
