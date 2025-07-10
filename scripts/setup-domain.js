#!/usr/bin/env node

/**
 * Domain Setup Script for Sensory Smart
 * 
 * This script helps configure the subdomain app.getsensorysmart.com
 * 
 * Steps to complete:
 * 1. Add domain in Vercel dashboard
 * 2. Configure DNS records
 * 3. Update environment variables
 */

console.log('🌐 Sensory Smart Domain Setup')
console.log('=============================\n')

console.log('📋 Steps to configure app.getsensorysmart.com:\n')

console.log('1. 🎯 Add Domain in Vercel:')
console.log('   - Go to your Vercel dashboard')
console.log('   - Navigate to your project settings')
console.log('   - Go to "Domains" section')
console.log('   - Add: app.getsensorysmart.com')
console.log('   - Vercel will provide DNS records to configure\n')

console.log('2. 🔧 Configure DNS Records:')
console.log('   - Log into your domain registrar (where getsensorysmart.com is registered)')
console.log('   - Add these DNS records:')
console.log('     Type: A')
console.log('     Name: app')
console.log('     Value: 76.76.19.76')
console.log('     TTL: 3600')
console.log('   - Add CNAME record:')
console.log('     Type: CNAME')
console.log('     Name: app')
console.log('     Value: cname.vercel-dns.com')
console.log('     TTL: 3600\n')

console.log('3. ⚙️ Update Environment Variables:')
console.log('   - Add to Vercel environment variables:')
console.log('     NEXT_PUBLIC_APP_URL=https://app.getsensorysmart.com')
console.log('     NEXT_PUBLIC_APP_NAME=Sensory Smart')
console.log('     NEXT_PUBLIC_APP_DOMAIN=app.getsensorysmart.com\n')

console.log('4. 🔄 Deploy with new domain:')
console.log('   - Run: npx vercel --prod')
console.log('   - Verify the domain is working')
console.log('   - Test PWA installation\n')

console.log('5. ✅ Verify Setup:')
console.log('   - Check SSL certificate is active')
console.log('   - Test PWA installation on mobile')
console.log('   - Verify all features work on subdomain\n')

console.log('🎉 Your Sensory Smart app will be live at:')
console.log('   https://app.getsensorysmart.com\n')

console.log('📱 PWA Installation:')
console.log('   - Users can add to home screen')
console.log('   - Works offline with cached activities')
console.log('   - Native app-like experience\n')

console.log('💡 Tips:')
console.log('   - DNS changes can take up to 48 hours to propagate')
console.log('   - Use Vercel\'s domain verification tools')
console.log('   - Test on multiple devices and browsers')
console.log('   - Monitor performance and uptime') 