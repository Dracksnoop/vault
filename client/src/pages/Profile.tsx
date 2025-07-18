import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Building, MapPin, Phone, Mail, Globe, FileText, Upload, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { insertCompanyProfileSchema, type CompanyProfile } from '@shared/schema';

const profileFormSchema = insertCompanyProfileSchema.extend({
  logoFile: z.instanceof(File).optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: companyProfile, isLoading } = useQuery<CompanyProfile | null>({
    queryKey: ['/api/company-profiles/default'],
    queryFn: async () => {
      const response = await fetch('/api/company-profiles/default');
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch company profile');
      }
      return response.json();
    },
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      companyName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      stateProvince: '',
      country: '',
      zipPostalCode: '',
      phoneNumber: '',
      emailAddress: '',
      gstNumber: '',
      websiteUrl: '',
      isDefault: true,
    },
  });

  // Update form when profile data is loaded
  React.useEffect(() => {
    if (companyProfile) {
      form.reset({
        companyName: companyProfile.companyName || '',
        addressLine1: companyProfile.addressLine1 || '',
        addressLine2: companyProfile.addressLine2 || '',
        city: companyProfile.city || '',
        stateProvince: companyProfile.stateProvince || '',
        country: companyProfile.country || '',
        zipPostalCode: companyProfile.zipPostalCode || '',
        phoneNumber: companyProfile.phoneNumber || '',
        emailAddress: companyProfile.emailAddress || '',
        gstNumber: companyProfile.gstNumber || '',
        websiteUrl: companyProfile.websiteUrl || '',
        isDefault: companyProfile.isDefault || true,
      });
      if (companyProfile.logoData) {
        setLogoPreview(companyProfile.logoData);
      }
    }
  }, [companyProfile, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const profileData = {
        companyName: data.companyName,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        stateProvince: data.stateProvince,
        country: data.country,
        zipPostalCode: data.zipPostalCode,
        phoneNumber: data.phoneNumber,
        emailAddress: data.emailAddress,
        gstNumber: data.gstNumber,
        websiteUrl: data.websiteUrl,
        isDefault: data.isDefault,
        logoData: logoPreview,
      };

      if (companyProfile) {
        return apiRequest(`/api/company-profiles/${companyProfile.id}`, {
          method: 'PUT',
          body: JSON.stringify(profileData),
        });
      } else {
        return apiRequest('/api/company-profiles', {
          method: 'POST',
          body: JSON.stringify(profileData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company-profiles/default'] });
    },
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogoError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setLogoError('Please select a valid image file (JPEG or PNG)');
      return;
    }

    // Validate file size (50KB = 50 * 1024 bytes)
    if (file.size > 50 * 1024) {
      setLogoError('Logo file must be smaller than 50KB');
      return;
    }

    // Create image to check dimensions
    const img = new Image();
    img.onload = () => {
      if (img.width !== 500 || img.height !== 500) {
        setLogoError('Logo must be exactly 500x500 pixels');
        return;
      }

      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setLogoPreview(base64);
      };
      reader.readAsDataURL(file);
    };
    img.onerror = () => {
      setLogoError('Invalid image file');
    };
    img.src = URL.createObjectURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: ProfileFormData) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Company Profile</h1>
          <p className="text-gray-600 mt-1">Manage your company information and logo for invoices</p>
        </div>
        {companyProfile && (
          <Badge variant="secondary" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Profile Active
          </Badge>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  {...form.register('companyName')}
                  placeholder="Your Company Name"
                  className="mt-1"
                />
                {form.formState.errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  {...form.register('gstNumber')}
                  placeholder="GST Registration Number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  {...form.register('websiteUrl')}
                  placeholder="https://yourcompany.com"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  {...form.register('phoneNumber')}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1"
                />
                {form.formState.errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="emailAddress">Email Address *</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  {...form.register('emailAddress')}
                  placeholder="contact@yourcompany.com"
                  className="mt-1"
                />
                {form.formState.errors.emailAddress && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.emailAddress.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  {...form.register('addressLine1')}
                  placeholder="Street address"
                  className="mt-1"
                />
                {form.formState.errors.addressLine1 && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.addressLine1.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  {...form.register('addressLine2')}
                  placeholder="Apartment, suite, etc."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...form.register('city')}
                  placeholder="City"
                  className="mt-1"
                />
                {form.formState.errors.city && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.city.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="stateProvince">State/Province *</Label>
                <Input
                  id="stateProvince"
                  {...form.register('stateProvince')}
                  placeholder="State or Province"
                  className="mt-1"
                />
                {form.formState.errors.stateProvince && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.stateProvince.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  {...form.register('country')}
                  placeholder="Country"
                  className="mt-1"
                />
                {form.formState.errors.country && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.country.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="zipPostalCode">ZIP/Postal Code *</Label>
                <Input
                  id="zipPostalCode"
                  {...form.register('zipPostalCode')}
                  placeholder="ZIP or Postal Code"
                  className="mt-1"
                />
                {form.formState.errors.zipPostalCode && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.zipPostalCode.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Company Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <Label htmlFor="logo">Upload Logo</Label>
                <p className="text-sm text-gray-600 mt-1">
                  Upload your company logo for invoices. Must be exactly 500x500 pixels, under 50KB, JPEG or PNG format.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="logo"
                  accept="image/jpeg,image/png"
                  onChange={handleLogoUpload}
                  className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                />
                {logoError && (
                  <Alert className="mt-2">
                    <X className="h-4 w-4" />
                    <AlertDescription>{logoError}</AlertDescription>
                  </Alert>
                )}
              </div>

              {logoPreview && (
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">500x500px</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-8"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>

      {saveMutation.isSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Company profile saved successfully! Your information will now appear on invoices.
          </AlertDescription>
        </Alert>
      )}

      {saveMutation.isError && (
        <Alert className="bg-red-50 border-red-200">
          <X className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to save company profile. Please try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}