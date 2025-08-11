# Deployment Guide - VAT Calculator Pro

## Quick Deployment Options

### Option 1: Netlify Drag & Drop (Fastest)
1. **Zip the Project**: Create a zip file of the entire project directory
2. **Visit Netlify**: Go to [netlify.com](https://netlify.com) and sign up/login
3. **Drag & Drop**: Drag your zip file to the Netlify dashboard
4. **Get URL**: Your app will be live at `https://random-name.netlify.app`
5. **Custom Domain** (optional): Change the site name in Netlify settings

### Option 2: GitHub + Netlify (Recommended)
1. **Push to GitHub**: Push your code to a GitHub repository
2. **Connect Netlify**: 
   - Login to Netlify
   - Click "New site from Git"
   - Connect to GitHub and select your repository
3. **Configure Build**:
   - Build command: Leave empty (static site)
   - Publish directory: `/` (root)
4. **Deploy**: Site will auto-deploy on every push to main branch

### Option 3: Manual Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from project directory
netlify deploy

# Deploy to production
netlify deploy --prod
```

## Environment Configuration

### Environment Variables (if needed)
```bash
# In Netlify dashboard > Site settings > Environment variables
ANALYTICS_ID=your-google-analytics-id
ERROR_REPORTING=true
CONTACT_EMAIL=support@yourcompany.com
```

### Build Settings
- **Build command**: `echo "Static site - no build required"`
- **Publish directory**: `.` (current directory)
- **Functions directory**: Leave empty

## Custom Domain Setup

### Using Netlify Domain
1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions

### DNS Configuration
```
# Add these records to your DNS provider:
Type: CNAME
Name: www
Value: your-site.netlify.app

Type: A
Name: @
Value: 75.2.60.5
```

## SSL Certificate
- SSL is automatically provided by Netlify
- Force HTTPS is configured in `netlify.toml`
- Certificate renews automatically

## Performance Optimization

### Asset Optimization
- CSS and JS files are cached for 1 year
- HTML files are not cached (always fresh)
- Images are compressed automatically

### CDN Configuration
- Netlify provides global CDN automatically
- Assets are served from nearest edge location
- Gzip compression is enabled

## Security Headers

The following security headers are configured in `netlify.toml`:

```toml
X-Frame-Options = "DENY"
X-Content-Type-Options = "nosniff"
X-XSS-Protection = "1; mode=block"
Referrer-Policy = "strict-origin-when-cross-origin"
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; ..."
```

## Monitoring and Analytics

### Netlify Analytics
- Enable in Site settings > Analytics
- Track page views, unique visitors, top pages
- No code changes required

### Google Analytics (Optional)
1. Get tracking ID from Google Analytics
2. Add to environment variables
3. Update `analytics-manager.js` if implemented

### Error Monitoring
- Client-side errors are logged to console
- Can integrate with Sentry or similar service
- Error reports available in browser dev tools

## Backup and Recovery

### Automatic Backups
- Git repository serves as backup
- Netlify keeps deployment history
- Can rollback to any previous deployment

### Manual Backup
```bash
# Download current site
wget -r -np -k https://your-site.netlify.app

# Or use Netlify CLI
netlify sites:list
netlify api sites/{site-id}/files
```

## Branch Deploys

### Preview Deployments
- Every pull request gets a preview URL
- Test changes before merging
- Configured in GitHub Actions workflow

### Branch Configuration
```bash
# Deploy specific branch
netlify deploy --alias=staging

# Production deploy
netlify deploy --prod
```

## Troubleshooting

### Common Issues

**Site Not Loading**
- Check `_redirects` file syntax
- Verify `netlify.toml` configuration
- Check build logs in Netlify dashboard

**Files Not Found**
- Ensure file paths are correct
- Check case sensitivity
- Verify files are committed to git

**Slow Loading**
- Check file sizes (Excel processing can be slow)
- Monitor browser console for errors
- Use Lighthouse audit for optimization

**CSP Errors**
- Check Content Security Policy in `netlify.toml`
- Add required domains to CSP whitelist
- Check browser console for specific violations

### Debug Commands
```bash
# Test locally
python -m http.server 8000
# or
npx serve .

# Check build output
netlify build

# Test functions locally
netlify dev
```

## Advanced Configuration

### Form Handling
```html
<!-- Enable Netlify form handling -->
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <!-- form fields -->
</form>
```

### Redirects for SPA
```
# In _redirects file
/upload /upload/index.html 200
/results /results/index.html 200
/* /index.html 200
```

### Edge Functions (Advanced)
```javascript
// netlify/edge-functions/analytics.js
export default async (request, context) => {
  // Custom edge logic
  return context.next();
};
```

## Production Checklist

- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Analytics tracking enabled
- [ ] Error monitoring set up
- [ ] Performance optimized (Lighthouse score > 90)
- [ ] Security headers configured
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Team access permissions set
- [ ] Documentation updated

## Support Resources

- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **Netlify Community**: [community.netlify.com](https://community.netlify.com)
- **Status Page**: [netlifystatus.com](https://netlifystatus.com)
- **Support**: support@netlify.com

## Cost Considerations

### Free Tier Limits
- 100GB bandwidth/month
- 300 build minutes/month
- 1 concurrent build
- Community support

### Pro Tier Benefits ($19/month)
- 400GB bandwidth/month
- 1000 build minutes/month
- 3 concurrent builds
- Priority support
- Custom headers/redirects

Choose based on your traffic and deployment frequency needs.
