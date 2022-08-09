/*

  Direct Draw Surface
  https://docs.microsoft.com/en-us/windows/desktop/direct3ddds/dx-graphics-dds-pguide

*/
export const DDS_MAGIC = 0x20534444;
export const DDSD_CAPS = 0x1;
export const DDSD_HEIGHT = 0x2;
export const DDSD_WIDTH = 0x4;
export const DDSD_PITCH = 0x8;
export const DDSD_PIXELFORMAT = 0x1000;
export const DDSD_MIPMAPCOUNT = 0x20000;
export const DDSD_LINEARSIZE = 0x80000;
export const DDSD_DEPTH = 0x800000;

export const DDSCAPS_COMPLEX = 0x8;
export const DDSCAPS_MIPMAP = 0x400000;
export const DDSCAPS_TEXTURE = 0x1000;

export const DDSCAPS2_CUBEMAP = 0x200;
export const DDSCAPS2_CUBEMAP_POSITIVEX = 0x400;
export const DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800;
export const DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000;
export const DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000;
export const DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000;
export const DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000;
export const DDSCAPS2_VOLUME = 0x200000;

export const DDPF_ALPHAPIXELS = 0x1;
export const DDPF_ALPHA = 0x2;
export const DDPF_FOURCC = 0x4;
export const DDPF_RGB = 0x40;
export const DDPF_YUV = 0x200;
export const DDPF_LUMINANCE = 0x20000;

export const DDS_HEADER_LENGTH_INT = 31;
export const DDS_HEADER_OFFSET_MAGIC = 0;
export const DDS_HEADER_OFFSET_SIZE = 1;
export const DDS_HEADER_OFFSET_FLAGS = 2;
export const DDS_HEADER_OFFSET_HEIGHT = 3;
export const DDS_HEADER_OFFSET_WIDTH = 4;
export const DDS_HEADER_OFFSET_MIPMAP_COUNT = 7;
export const DDS_HEADER_OFFSET_PF_FLAGS = 20;
export const DDS_HEADER_OFFSET_PF_FOURCC = 21;
export const DDS_HEADER_OFFSET_RGB_BPP = 22;
export const DDS_HEADER_OFFSET_R_MASK = 23;
export const DDS_HEADER_OFFSET_G_MASK = 24;
export const DDS_HEADER_OFFSET_B_MASK = 25;
export const DDS_HEADER_OFFSET_A_MASK = 26;
export const DDS_HEADER_OFFSET_CAPS1 = 27;
export const DDS_HEADER_OFFSET_CAPS2 = 28;
export const DDS_HEADER_OFFSET_CAPS3 = 29;
export const DDS_HEADER_OFFSET_CAPS4 = 30;
export const DDS_HEADER_OFFSET_DXGI_FORMAT = 32;

export const FOURCC_ATI1 = 826889281;
export const FOURCC_ATI2 = 843666497;
export const FOURCC_ETC1 = 826496069;
export const FOURCC_DXT1 = 827611204;
export const FOURCC_DXT5 = 894720068;
export const FOURCC_DXT3 = 861165636;
export const FOURCC_DXT10 = 827611204;
export const FOURCC_D3DFMT_R16G16B16A16F = 113;
export const FOURCC_D3DFMT_R32G32B32A32F = 116;

export const DXGI_FORMAT_R16G16B16A16_FLOAT = 10;
export const DXGI_FORMAT_R32G32B32A32_FLOAT = 2;
export const DXGI_FORMAT_B8G8R8X8_UNORM = 88;


export const DDS_DX10_FIELDS = {
    DXGI_FORMAT: 0,
    RESOURCE_DIMENSION: 1,
    MISC_FLAG: 2,
    ARRAY_SIZE: 3,
    MISC_FLAGS2: 4
};

export const DDS_MAGIC_SIZE = 4;
export const DDS_HEADER_SIZE = 124;
export const DDS_HEADER_PF_SIZE = 32;
export const DDS_HEADER_DX10_SIZE = 20;

export const D3D10_RESOURCE_DIMENSION = {
    DDS_DIMENSION_TEXTURE1D : 2,
    DDS_DIMENSION_TEXTURE2D : 3,
    DDS_DIMENSION_TEXTURE3D : 6
};



export const DXGI_FORMAT = [
    "DXGI_FORMAT_UNKNOWN",
    "DXGI_FORMAT_R32G32B32A32_TYPELESS",
    "DXGI_FORMAT_R32G32B32A32_FLOAT",
    "DXGI_FORMAT_R32G32B32A32_UINT",
    "DXGI_FORMAT_R32G32B32A32_SINT",
    "DXGI_FORMAT_R32G32B32_TYPELESS",
    "DXGI_FORMAT_R32G32B32_FLOAT",
    "DXGI_FORMAT_R32G32B32_UINT",
    "DXGI_FORMAT_R32G32B32_SINT",
    "DXGI_FORMAT_R16G16B16A16_TYPELESS",
    "DXGI_FORMAT_R16G16B16A16_FLOAT",
    "DXGI_FORMAT_R16G16B16A16_UNORM",
    "DXGI_FORMAT_R16G16B16A16_UINT",
    "DXGI_FORMAT_R16G16B16A16_SNORM",
    "DXGI_FORMAT_R16G16B16A16_SINT",
    "DXGI_FORMAT_R32G32_TYPELESS",
    "DXGI_FORMAT_R32G32_FLOAT",
    "DXGI_FORMAT_R32G32_UINT",
    "DXGI_FORMAT_R32G32_SINT",
    "DXGI_FORMAT_R32G8X24_TYPELESS",
    "DXGI_FORMAT_D32_FLOAT_S8X24_UINT",
    "DXGI_FORMAT_R32_FLOAT_X8X24_TYPELESS",
    "DXGI_FORMAT_X32_TYPELESS_G8X24_UINT",
    "DXGI_FORMAT_R10G10B10A2_TYPELESS",
    "DXGI_FORMAT_R10G10B10A2_UNORM",
    "DXGI_FORMAT_R10G10B10A2_UINT",
    "DXGI_FORMAT_R11G11B10_FLOAT",
    "DXGI_FORMAT_R8G8B8A8_TYPELESS",
    "DXGI_FORMAT_R8G8B8A8_UNORM",
    "DXGI_FORMAT_R8G8B8A8_UNORM_SRGB",
    "DXGI_FORMAT_R8G8B8A8_UINT",
    "DXGI_FORMAT_R8G8B8A8_SNORM",
    "DXGI_FORMAT_R8G8B8A8_SINT",
    "DXGI_FORMAT_R16G16_TYPELESS",
    "DXGI_FORMAT_R16G16_FLOAT",
    "DXGI_FORMAT_R16G16_UNORM",
    "DXGI_FORMAT_R16G16_UINT",
    "DXGI_FORMAT_R16G16_SNORM",
    "DXGI_FORMAT_R16G16_SINT",
    "DXGI_FORMAT_R32_TYPELESS",
    "DXGI_FORMAT_D32_FLOAT",
    "DXGI_FORMAT_R32_FLOAT",
    "DXGI_FORMAT_R32_UINT",
    "DXGI_FORMAT_R32_SINT",
    "DXGI_FORMAT_R24G8_TYPELESS",
    "DXGI_FORMAT_D24_UNORM_S8_UINT",
    "DXGI_FORMAT_R24_UNORM_X8_TYPELESS",
    "DXGI_FORMAT_X24_TYPELESS_G8_UINT",
    "DXGI_FORMAT_R8G8_TYPELESS",
    "DXGI_FORMAT_R8G8_UNORM",
    "DXGI_FORMAT_R8G8_UINT",
    "DXGI_FORMAT_R8G8_SNORM",
    "DXGI_FORMAT_R8G8_SINT",
    "DXGI_FORMAT_R16_TYPELESS",
    "DXGI_FORMAT_R16_FLOAT",
    "DXGI_FORMAT_D16_UNORM",
    "DXGI_FORMAT_R16_UNORM",
    "DXGI_FORMAT_R16_UINT",
    "DXGI_FORMAT_R16_SNORM",
    "DXGI_FORMAT_R16_SINT",
    "DXGI_FORMAT_R8_TYPELESS",
    "DXGI_FORMAT_R8_UNORM",
    "DXGI_FORMAT_R8_UINT",
    "DXGI_FORMAT_R8_SNORM",
    "DXGI_FORMAT_R8_SINT",
    "DXGI_FORMAT_A8_UNORM",
    "DXGI_FORMAT_R1_UNORM",
    "DXGI_FORMAT_R9G9B9E5_SHAREDEXP",
    "DXGI_FORMAT_R8G8_B8G8_UNORM",
    "DXGI_FORMAT_G8R8_G8B8_UNORM",
    "DXGI_FORMAT_BC1_TYPELESS",
    "DXGI_FORMAT_BC1_UNORM",
    "DXGI_FORMAT_BC1_UNORM_SRGB",
    "DXGI_FORMAT_BC2_TYPELESS",
    "DXGI_FORMAT_BC2_UNORM",
    "DXGI_FORMAT_BC2_UNORM_SRGB",
    "DXGI_FORMAT_BC3_TYPELESS",
    "DXGI_FORMAT_BC3_UNORM",
    "DXGI_FORMAT_BC3_UNORM_SRGB",
    "DXGI_FORMAT_BC4_TYPELESS",
    "DXGI_FORMAT_BC4_UNORM",
    "DXGI_FORMAT_BC4_SNORM",
    "DXGI_FORMAT_BC5_TYPELESS",
    "DXGI_FORMAT_BC5_UNORM",
    "DXGI_FORMAT_BC5_SNORM",
    "DXGI_FORMAT_B5G6R5_UNORM",
    "DXGI_FORMAT_B5G5R5A1_UNORM",
    "DXGI_FORMAT_B8G8R8A8_UNORM",
    "DXGI_FORMAT_B8G8R8X8_UNORM",
    "DXGI_FORMAT_R10G10B10_XR_BIAS_A2_UNORM",
    "DXGI_FORMAT_B8G8R8A8_TYPELESS",
    "DXGI_FORMAT_B8G8R8A8_UNORM_SRGB",
    "DXGI_FORMAT_B8G8R8X8_TYPELESS",
    "DXGI_FORMAT_B8G8R8X8_UNORM_SRGB",
    "DXGI_FORMAT_BC6H_TYPELESS",
    "DXGI_FORMAT_BC6H_UF16",
    "DXGI_FORMAT_BC6H_SF16",
    "DXGI_FORMAT_BC7_TYPELESS",
    "DXGI_FORMAT_BC7_UNORM",
    "DXGI_FORMAT_BC7_UNORM_SRGB",
    "DXGI_FORMAT_AYUV",
    "DXGI_FORMAT_Y410",
    "DXGI_FORMAT_Y416",
    "DXGI_FORMAT_NV12",
    "DXGI_FORMAT_P010",
    "DXGI_FORMAT_P016",
    "DXGI_FORMAT_420_OPAQUE",
    "DXGI_FORMAT_YUY2",
    "DXGI_FORMAT_Y210",
    "DXGI_FORMAT_Y216",
    "DXGI_FORMAT_NV11",
    "DXGI_FORMAT_AI44",
    "DXGI_FORMAT_IA44",
    "DXGI_FORMAT_P8",
    "DXGI_FORMAT_A8P8",
    "DXGI_FORMAT_B4G4R4A4_UNORM",
    "DXGI_FORMAT_P208",
    "DXGI_FORMAT_V208",
    "DXGI_FORMAT_V408",
    "DXGI_FORMAT_SAMPLER_FEEDBACK_MIN_MIP_OPAQUE",
    "DXGI_FORMAT_SAMPLER_FEEDBACK_MIP_REGION_USED_OPAQUE",
    "DXGI_FORMAT_FORCE_UINT"
];

export const INTERNAL_FORMATS = {
    COMPRESSED_RGB_S3TC_DXT1_EXT: 0x83F0,
    COMPRESSED_RGBA_S3TC_DXT1_EXT: 0x83F1,
    COMPRESSED_RGBA_S3TC_DXT3_EXT: 0x83F2,
    COMPRESSED_RGBA_S3TC_DXT5_EXT: 0x83F3,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT: 35917,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT: 35918,
    COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT: 35919,
    COMPRESSED_SRGB_S3TC_DXT1_EXT: 35916,
    COMPRESSED_R11_EAC: 0x9270,
    COMPRESSED_SIGNED_R11_EAC: 0x9271,
    COMPRESSED_RG11_EAC: 0x9272,
    COMPRESSED_SIGNED_RG11_EAC: 0x9273,
    COMPRESSED_RGB8_ETC2: 0x9274,
    COMPRESSED_RGBA8_ETC2_EAC: 0x9278,
    COMPRESSED_SRGB8_ETC2: 0x9275,
    COMPRESSED_SRGB8_ALPHA8_ETC2_EAC: 0x9279,
    COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2: 0x9276,
    COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2: 0x9277,
    COMPRESSED_RGB_PVRTC_4BPPV1_IMG: 0x8C00,
    COMPRESSED_RGBA_PVRTC_4BPPV1_IMG: 0x8C02,
    COMPRESSED_RGB_PVRTC_2BPPV1_IMG: 0x8C01,
    COMPRESSED_RGBA_PVRTC_2BPPV1_IMG: 0x8C03,
    COMPRESSED_RGB_ETC1_WEBGL: 0x8D64,
    COMPRESSED_RGB_ATC_WEBGL: 0x8C92,
    COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL: 0x8C92,
    COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL: 0x87EE,
};

export const FOURCC_TO_FORMAT = {
    [FOURCC_DXT1]: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT1_EXT,
    [FOURCC_DXT3]: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT3_EXT,
    [FOURCC_DXT5]: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT
};

export const INTERNAL_FORMAT_TO_BYTES_PER_PIXEL = {
    // WEBGL_compressed_texture_s3tc
    [INTERNAL_FORMATS.COMPRESSED_RGB_S3TC_DXT1_EXT]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT1_EXT]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT3_EXT]: 1,
    [INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT]: 1,
    // WEBGL_compressed_texture_s3tc
    [INTERNAL_FORMATS.COMPRESSED_SRGB_S3TC_DXT1_EXT]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT]: 1,
    [INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT]: 1,
    // WEBGL_compressed_texture_etc
    [INTERNAL_FORMATS.COMPRESSED_R11_EAC]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_SIGNED_R11_EAC]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_RG11_EAC]: 1,
    [INTERNAL_FORMATS.COMPRESSED_SIGNED_RG11_EAC]: 1,
    [INTERNAL_FORMATS.COMPRESSED_RGB8_ETC2]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_RGBA8_ETC2_EAC]: 1,
    [INTERNAL_FORMATS.COMPRESSED_SRGB8_ETC2]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC]: 1,
    [INTERNAL_FORMATS.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2]: 0.5,
    // WEBGL_compressed_texture_pvrtc
    [INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_4BPPV1_IMG]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_2BPPV1_IMG]: 0.25,
    [INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG]: 0.25,
    // WEBGL_compressed_texture_etc1
    [INTERNAL_FORMATS.COMPRESSED_RGB_ETC1_WEBGL]: 0.5,
    // WEBGL_compressed_texture_atc
    [INTERNAL_FORMATS.COMPRESSED_RGB_ATC_WEBGL]: 0.5,
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL]: 1,
    [INTERNAL_FORMATS.COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL]: 1
};

export const DXGI_TO_FORMAT = {
    [DXGI_FORMAT.indexOf("DXGI_FORMAT_BC1_TYPELESS")]: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT1_EXT,
    [DXGI_FORMAT.indexOf("DXGI_FORMAT_BC1_UNORM")]: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT1_EXT,
    [DXGI_FORMAT.indexOf("DXGI_FORMAT_BC2_TYPELESS")]: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT3_EXT,
    [DXGI_FORMAT.indexOf("DXGI_FORMAT_BC2_UNORM")]: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT3_EXT,
    [DXGI_FORMAT.indexOf("DXGI_FORMAT_BC3_TYPELESS")]: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT,
    [DXGI_FORMAT.indexOf("DXGI_FORMAT_BC3_UNORM")]: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT,
    [DXGI_FORMAT.indexOf("DXGI_FORMAT_BC1_UNORM_SRGB")]: INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT,
    [DXGI_FORMAT.indexOf("DXGI_FORMAT_BC2_UNORM_SRGB")]: INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT,
    [DXGI_FORMAT.indexOf("DXGI_FORMAT_BC3_UNORM_SRGB")]: INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT
};

export function formatToExtension(format)
{
    if (format >= 0x83F0 && format <= 0x83F3)
    {
        return "s3tc";
    }
    else if (format >= 0x9270 && format <= 0x9279)
    {
        return "etc";
    }
    else if (format >= 0x8C00 && format <= 0x8C03)
    {
        return "pvrtc";
    }
    else if (format >= 0x8D64)
    {
        return "etc1";
    }
    else if (format >= 0x8C92 && format <= 0x87EE)
    {
        return "atc";
    }
    throw new Error("Invalid compressed format");
}
