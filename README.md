# food_application
Fullstack appliation for food delivery 

## Cloudinary image uploads

Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
in the **backend** environment (for example, the server's Render environment
variables). Do not put the API secret in the frontend. Authenticated users can
upload profile images, and approved restaurant owners can upload menu-item
photos. JPEG, PNG, and WebP files up to 5 MB are supported. Replacing or
removing a managed image also removes its old Cloudinary asset.

Super admins can review paginated user account details from the dashboard's
Users section. Account credentials and authentication tokens are never
included in those admin responses.
