-- CreateTable
CREATE TABLE "AspNetUsers" (
    "Id" TEXT NOT NULL,
    "UserName" TEXT,
    "NormalizedUserName" TEXT,
    "Email" TEXT,
    "NormalizedEmail" TEXT,
    "EmailConfirmed" BOOLEAN NOT NULL,
    "PasswordHash" TEXT,
    "SecurityStamp" TEXT,
    "ConcurrencyStamp" TEXT,
    "PhoneNumber" TEXT,
    "PhoneNumberConfirmed" BOOLEAN NOT NULL,
    "TwoFactorEnabled" BOOLEAN NOT NULL,
    "LockoutEnd" TIMESTAMP(3),
    "LockoutEnabled" BOOLEAN NOT NULL,
    "AccessFailedCount" INTEGER NOT NULL,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "CountryCode" TEXT NOT NULL,
    "Gender" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AspNetUsers_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "AspNetRoles" (
    "Id" TEXT NOT NULL,
    "Name" TEXT,
    "NormalizedName" TEXT,
    "ConcurrencyStamp" TEXT,

    CONSTRAINT "AspNetRoles_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "AspNetUserRoles" (
    "UserId" TEXT NOT NULL,
    "RoleId" TEXT NOT NULL,

    CONSTRAINT "AspNetUserRoles_pkey" PRIMARY KEY ("UserId","RoleId")
);

-- CreateTable
CREATE TABLE "AspNetRoleClaims" (
    "Id" SERIAL NOT NULL,
    "RoleId" TEXT NOT NULL,
    "ClaimType" TEXT,
    "ClaimValue" TEXT,

    CONSTRAINT "AspNetRoleClaims_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "AspNetUserClaims" (
    "Id" SERIAL NOT NULL,
    "UserId" TEXT NOT NULL,
    "ClaimType" TEXT,
    "ClaimValue" TEXT,

    CONSTRAINT "AspNetUserClaims_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "AspNetUserLogins" (
    "UserId" TEXT NOT NULL,
    "LoginProvider" TEXT NOT NULL,
    "ProviderKey" TEXT NOT NULL,
    "ProviderDisplayName" TEXT,

    CONSTRAINT "AspNetUserLogins_pkey" PRIMARY KEY ("LoginProvider","ProviderKey")
);

-- CreateTable
CREATE TABLE "AspNetUserTokens" (
    "UserId" TEXT NOT NULL,
    "LoginProvider" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Value" TEXT,

    CONSTRAINT "AspNetUserTokens_pkey" PRIMARY KEY ("UserId","LoginProvider","Name")
);

-- CreateTable
CREATE TABLE "Books" (
    "Id" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "Author" TEXT NOT NULL,
    "Genre" TEXT NOT NULL,
    "Publishing" TEXT NOT NULL,
    "Created" TEXT NOT NULL,
    "ImageUrl" TEXT NOT NULL,
    "Price" DECIMAL(10,2),
    "Isbn" TEXT NOT NULL,
    "Language" TEXT NOT NULL,
    "PageCount" INTEGER NOT NULL,
    "IsAvailable" BOOLEAN NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Books_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Carts" (
    "Id" TEXT NOT NULL,
    "UserId" TEXT NOT NULL,

    CONSTRAINT "Carts_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "CartItems" (
    "Id" TEXT NOT NULL,
    "CartId" TEXT NOT NULL,
    "BookId" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "PriceSnapshot" DECIMAL(10,2),

    CONSTRAINT "CartItems_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "Id" TEXT NOT NULL,
    "UserId" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "TotalAmount" DECIMAL(10,2) NOT NULL,
    "ShippingAddress" TEXT NOT NULL,
    "CustomerName" TEXT NOT NULL,
    "CustomerEmail" TEXT NOT NULL,
    "CustomerPhone" TEXT,
    "Notes" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OrderItems" (
    "Id" TEXT NOT NULL,
    "OrderId" TEXT NOT NULL,
    "BookId" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "UnitPrice" DECIMAL(10,2) NOT NULL,
    "TotalPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OrderItems_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE INDEX "AspNetUsers_NormalizedEmail_idx" ON "AspNetUsers"("NormalizedEmail");

-- CreateIndex
CREATE UNIQUE INDEX "AspNetUsers_NormalizedUserName_key" ON "AspNetUsers"("NormalizedUserName");

-- CreateIndex
CREATE UNIQUE INDEX "AspNetRoles_NormalizedName_key" ON "AspNetRoles"("NormalizedName");

-- CreateIndex
CREATE INDEX "AspNetUserRoles_RoleId_idx" ON "AspNetUserRoles"("RoleId");

-- CreateIndex
CREATE INDEX "AspNetRoleClaims_RoleId_idx" ON "AspNetRoleClaims"("RoleId");

-- CreateIndex
CREATE INDEX "AspNetUserClaims_UserId_idx" ON "AspNetUserClaims"("UserId");

-- CreateIndex
CREATE INDEX "AspNetUserLogins_UserId_idx" ON "AspNetUserLogins"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "Carts_UserId_key" ON "Carts"("UserId");

-- CreateIndex
CREATE INDEX "CartItems_BookId_idx" ON "CartItems"("BookId");

-- CreateIndex
CREATE INDEX "CartItems_CartId_idx" ON "CartItems"("CartId");

-- CreateIndex
CREATE INDEX "OrderItems_BookId_idx" ON "OrderItems"("BookId");

-- CreateIndex
CREATE INDEX "OrderItems_OrderId_idx" ON "OrderItems"("OrderId");

-- AddForeignKey
ALTER TABLE "AspNetUserRoles" ADD CONSTRAINT "AspNetUserRoles_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AspNetUserRoles" ADD CONSTRAINT "AspNetUserRoles_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AspNetRoleClaims" ADD CONSTRAINT "AspNetRoleClaims_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AspNetUserClaims" ADD CONSTRAINT "AspNetUserClaims_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AspNetUserLogins" ADD CONSTRAINT "AspNetUserLogins_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AspNetUserTokens" ADD CONSTRAINT "AspNetUserTokens_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carts" ADD CONSTRAINT "Carts_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_CartId_fkey" FOREIGN KEY ("CartId") REFERENCES "Carts"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_BookId_fkey" FOREIGN KEY ("BookId") REFERENCES "Books"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "Orders"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_BookId_fkey" FOREIGN KEY ("BookId") REFERENCES "Books"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
