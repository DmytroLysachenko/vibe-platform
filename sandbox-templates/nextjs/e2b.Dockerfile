# Use Debian-based Node.js image
FROM node:21-slim

# Install curl and build tools
RUN apt-get update && apt-get install -y \
  curl \
  python3 \
  make \
  g++ \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy script
COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# Create working directory
WORKDIR /home/user

# Scaffold Next.js app without installing dependencies
RUN npx --yes create-next-app@15.3.3 nextjs-app --yes --no-install --use-pnpm

WORKDIR /home/user/nextjs-app

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile

# Initialize shadcn-ui
RUN pnpm dlx shadcn@2.6.3 init --yes -b neutral --force

# Add all components from shadcn-ui
RUN pnpm dlx shadcn@2.6.3 add --all --yes

# Move app content up one level and clean up
RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app
