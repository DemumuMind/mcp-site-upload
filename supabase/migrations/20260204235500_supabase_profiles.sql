-- DropTable
DROP TABLE IF EXISTS "Account";

-- DropTable
DROP TABLE IF EXISTS "Session";

-- DropTable
DROP TABLE IF EXISTS "VerificationToken";

-- DropTable
DROP TABLE IF EXISTS "User";

-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('admin', 'editor', 'viewer');
    END IF;
END $$;

-- CreateTable
CREATE TABLE "Profile" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- CreateIndex
CREATE INDEX "Profile_role_idx" ON "Profile"("role");

-- EnableRLS
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;

-- RestrictAccess
REVOKE ALL ON "Profile" FROM anon, authenticated;
GRANT SELECT ON "Profile" TO authenticated;

CREATE POLICY "Profiles are viewable by owner"
  ON "Profile"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
