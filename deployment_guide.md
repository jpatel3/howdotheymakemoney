# GitHub Repository Setup and Deployment Guide

## GitHub Repository Setup

1. Create a new GitHub repository:
   - Go to https://github.com/new
   - Repository name: howdotheymakemoney
   - Description: A website that provides clear, digestible information about how companies make money
   - Set to Public
   - Initialize with README: No (we already have one)
   - Click "Create repository"

2. Push the local repository to GitHub:
   ```bash
   git remote add origin https://github.com/jpatel3/howdotheymakemoney.git
   git push -u origin main
   ```

## Cloudflare Pages Deployment

1. Sign up for Cloudflare (if you don't have an account):
   - Go to https://dash.cloudflare.com/sign-up
   - Follow the registration process

2. Set up Cloudflare Pages:
   - In the Cloudflare dashboard, click on "Pages"
   - Click "Create a project"
   - Connect your GitHub account
   - Select the "howdotheymakemoney" repository
   - Configure build settings:
     - Project name: howdotheymakemoney
     - Production branch: main
     - Build command: npm run build
     - Build output directory: .next
     - Environment variables (if needed)
   - Click "Save and Deploy"

3. Wait for the initial build to complete

## DNS Configuration (GoDaddy to Cloudflare)

1. Get Cloudflare nameservers:
   - In Cloudflare, add your site (howdotheymakemoney.com)
   - Cloudflare will provide you with nameservers (e.g., ns1.cloudflare.com, ns2.cloudflare.com)

2. Update nameservers at GoDaddy:
   - Log in to your GoDaddy account
   - Go to your domain management page
   - Find "Nameservers" and select "Change"
   - Select "Custom" and enter the Cloudflare nameservers
   - Save changes

3. Configure DNS in Cloudflare:
   - In Cloudflare DNS settings, add:
     - CNAME record: www pointing to your Cloudflare Pages URL
     - A record: @ (root domain) pointing to Cloudflare's IP

4. Set up custom domain in Cloudflare Pages:
   - Go to your Pages project
   - Click on "Custom domains"
   - Add your domain (howdotheymakemoney.com)
   - Add www subdomain if desired

5. Wait for DNS propagation (can take up to 48 hours)

## Post-Deployment Verification

1. Test the website functionality
2. Check mobile responsiveness
3. Verify all features are working correctly
4. Monitor for any errors in Cloudflare analytics

## Maintenance

1. Set up GitHub Actions for CI/CD (optional)
2. Configure monitoring and alerts
3. Plan for regular updates and feature additions
