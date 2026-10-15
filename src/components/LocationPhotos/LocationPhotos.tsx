import React, { useState } from 'react';
import {
  MapPin,
  Upload,
  Trash2,
  Eye,
  AlertCircle,
  Building,
  CheckCircle2,
  Layers,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
} from 'lucide-react';
import {
  LocationPreset,
  BuildingConfig,
  SitePhoto,
} from '../../types/solar';
import { THAILAND_LOCATIONS } from '../../utils/solarCalculations';
import { DemoBadge } from '../Common/DemoBadge';
import { useLanguage } from '../../i18n/LanguageContext';
import { GoogleMapCadastre } from './GoogleMapCadastre';

interface LocationPhotosProps {
  currentLocation: LocationPreset;
  onSelectLocation: (loc: LocationPreset) => void;
  onUpdateCoords: (lat: number, lng: number, placeName?: string) => void;
  building: BuildingConfig;
  onUpdateBuilding: (b: Partial<BuildingConfig>) => void;
  photos: SitePhoto[];
  onAddPhoto: (photo: SitePhoto) => void;
  onRemovePhoto: (id: string) => void;
}

export const LocationPhotos: React.FC<LocationPhotosProps> = ({
  currentLocation,
  onSelectLocation,
  onUpdateCoords,
  building,
  onUpdateBuilding,
  photos,
  onAddPhoto,
  onRemovePhoto,
}) => {
  const { t, language } = useLanguage();
  const [latInput, setLatInput] = useState(currentLocation.lat.toString());
  const [lngInput, setLngInput] = useState(currentLocation.lng.toString());
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<SitePhoto | null>(null);
  const [mapZoom, setMapZoom] = useState(16);
  const [mapLayer, setMapLayer] = useState<'satellite' | 'terrain'>('satellite');

  const handleApplyCoords = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (!isNaN(lat) && !isNaN(lng)) {
      onUpdateCoords(lat, lng);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto: SitePhoto = {
            id: 'photo-' + Date.now() + '-' + i,
            name: file.name,
            url: event.target.result as string,
            type: file.name.toLowerCase().includes('roof') ? 'roof' : 'elevation',
            uploadedAt: new Date().toISOString().split('T')[0],
            isDemo: false,
            notes: `Reference photo (${(file.size / 1024).toFixed(0)} KB)`,
          };
          onAddPhoto(newPhoto);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const getLocationDesc = (loc: LocationPreset) => {
    if (language === 'th') {
      switch (loc.id) {
        case 'bkk':
          return 'ที่ราบภาคกลาง - อัตราค่าไฟฟ้าเชิงพาณิชย์สูง หน้าต่างแสงแดดสม่ำเสมอตลอดปี มีฝนชุกช่วง ส.ค.-ต.ค.';
        case 'cnx':
          return 'หุบเขาภาคเหนือ - ผลผลิตสูงในฤดูแล้ง (พ.ย.-เม.ย.) มีหมอกควันช่วง มี.ค.-เม.ย. และฟ้าโปร่งในฤดูหนาว';
        case 'hkt':
          return 'เกาะภูเก็ต / ฝั่งอันดามัน - แสงแดดเข้มข้น มีลมมรสุมตะวันตกเฉียงใต้ช่วง มิ.ย.-ต.ค.';
        case 'pty':
          return 'ชลบุรี / อีอีซี - ภาคอุตสาหกรรมเติบโตสูง ลมทะเลช่วยระบายความร้อนบนแผงโซลาร์';
        case 'kkn':
          return 'ที่ราบสูงขอนแก่น / อีสาน - ความเข้มแสงแดดสูง เมฆปกคลุมน้อยในฤดูแล้ง เหมาะแก่การผลิตไฟฟ้า';
        default:
          return loc.description;
      }
    }
    return loc.description;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#112239] rounded-xl p-5 border border-[#1B3252]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {t('locTitle')}
          </h2>
          <DemoBadge label={t('demoBadge')} variant="demo" />
          <DemoBadge label={t('assumedBadge')} variant="assumed" />
        </div>
        <p className="text-xs text-[#8FA3BF] mt-1.5 max-w-3xl">
          {t('locSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Location Presets & Coordinates & Map (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Thailand Presets Card */}
          <div className="bg-[#112239] rounded-xl p-5 border border-[#1B3252]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1B3252]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#27D3BC]" />
                <h3 className="text-sm font-semibold text-white">
                  {t('locPresetsTitle')}
                </h3>
              </div>
              <span className="text-xs text-[#8FA3BF] font-mono">
                {currentLocation.lat.toFixed(4)}° N, {currentLocation.lng.toFixed(4)}° E
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
              {THAILAND_LOCATIONS.map((loc) => {
                const isSelected = currentLocation.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      setLatInput(loc.lat.toString());
                      setLngInput(loc.lng.toString());
                    }}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#091526] border-[#27D3BC] shadow-md shadow-[#27D3BC]/10 ring-1 ring-[#27D3BC]'
                        : 'bg-[#0E1E34] border-[#1B3252] hover:border-[#27D3BC]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{loc.name}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#27D3BC]" />
                      )}
                    </div>
                    <div className="text-[11px] text-[#27D3BC] font-mono mt-0.5">
                      {loc.avgDailyIrradiation} kWh/m²/day
                    </div>
                    <p className="text-[10px] text-[#8FA3BF] mt-1 line-clamp-2 leading-tight">
                      {getLocationDesc(loc)}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Coordinates Input */}
            <div className="mt-4 pt-3 border-t border-[#1B3252]/60">
              <label className="text-xs font-semibold text-[#8FA3BF] block mb-2">
                {t('locCustomCoords')}
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-[#8FA3BF]">{t('locLat')}</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    className="w-full sm:w-28 bg-[#091526] border border-[#1B3252] rounded px-2.5 py-1 text-xs text-white font-mono focus:border-[#27D3BC] focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-[#8FA3BF]">{t('locLng')}</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={lngInput}
                    onChange={(e) => setLngInput(e.target.value)}
                    className="w-full sm:w-28 bg-[#091526] border border-[#1B3252] rounded px-2.5 py-1 text-xs text-white font-mono focus:border-[#27D3BC] focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleApplyCoords}
                  className="w-full sm:w-auto px-3.5 py-1 text-xs font-semibold bg-[#27D3BC] text-[#091526] hover:bg-[#20bfa9] rounded transition-colors shrink-0"
                >
                  {t('locUpdateCoords')}
                </button>
              </div>
            </div>
          </div>

          {/* Live Google Maps Satellite Cadastre Panel */}
          <div className="bg-[#112239] rounded-xl p-5 border border-[#1B3252]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1B3252] mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#27D3BC]" />
                <h3 className="text-sm font-semibold text-white">
                  {t('locCadastreTitle')}
                </h3>
                <DemoBadge label={t('locIntegrationReady')} variant="info" />
              </div>
            </div>

            <GoogleMapCadastre
              currentLocation={currentLocation}
              onUpdateCoords={(lat, lng, placeName) => {
                onUpdateCoords(lat, lng, placeName);
                setLatInput(lat.toFixed(4));
                setLngInput(lng.toFixed(4));
              }}
              building={building}
            />
          </div>
        </div>

        {/* Right Column: Site Reference Photos & Assumed Dimensions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#112239] rounded-xl p-5 border border-[#1B3252]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1B3252]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#27D3BC]" />
                <h3 className="text-sm font-semibold text-white">
                  {t('locPhotosTitle')} ({photos.length})
                </h3>
              </div>
            </div>

            {/* Upload Area */}
            <label className="mt-4 border-2 border-dashed border-[#1B3252] hover:border-[#27D3BC]/60 bg-[#091526]/60 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
              <Upload className="w-6 h-6 text-[#8FA3BF] group-hover:text-[#27D3BC] transition-colors mb-2" />
              <span className="text-xs font-semibold text-white">
                {t('locUploadTitle')}
              </span>
              <span className="text-[11px] text-[#8FA3BF] mt-0.5">
                {t('locUploadSub')}
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Photo List */}
            <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-[#091526] p-2.5 rounded-lg border border-[#1B3252] flex items-center justify-between gap-3 group hover:border-[#27D3BC]/30 transition-colors"
                >
                  <div
                    onClick={() => setSelectedPhotoPreview(photo)}
                    className="flex items-center gap-3 cursor-pointer overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-12 h-10 object-cover rounded bg-[#112239] border border-[#1B3252] shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-white truncate max-w-[160px] sm:max-w-[180px]">
                        {photo.name}
                      </p>
                      <p className="text-[10px] text-[#8FA3BF] truncate">
                        {photo.notes || `Uploaded ${photo.uploadedAt}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setSelectedPhotoPreview(photo)}
                      className="p-1.5 rounded text-[#8FA3BF] hover:text-[#27D3BC] hover:bg-[#112239] transition-colors"
                      title="Preview photo"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemovePhoto(photo.id)}
                      className="p-1.5 rounded text-[#8FA3BF] hover:text-rose-400 hover:bg-[#112239] transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Engineering Measurement Disclaimer */}
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-[11px] text-amber-200/90">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>{t('locDisclaimerTitle')}</strong> {t('locDisclaimerBody')}
              </p>
            </div>
          </div>

          {/* Independent Building Dimensions Card */}
          <div className="bg-[#112239] rounded-xl p-5 border border-[#1B3252]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1B3252]">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#27D3BC]" />
                <h3 className="text-sm font-semibold text-white">
                  {t('locBuildingDimensionsTitle')}
                </h3>
              </div>
              <DemoBadge label={t('locAssumedDimensions')} variant="assumed" />
            </div>

            <p className="text-xs text-[#8FA3BF] mt-2 mb-3">
              {t('locDimensionsSub')}
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#091526] p-2.5 rounded-lg border border-[#1B3252]">
                  <div className="flex justify-between mb-1">
                    <span className="text-[#8FA3BF]">{t('dockWidth')}:</span>
                    <span className="text-white font-mono font-bold">{building.width} m</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="18"
                    value={building.width}
                    onChange={(e) => onUpdateBuilding({ width: parseInt(e.target.value) })}
                    className="w-full accent-[#27D3BC] cursor-pointer"
                  />
                </div>

                <div className="bg-[#091526] p-2.5 rounded-lg border border-[#1B3252]">
                  <div className="flex justify-between mb-1">
                    <span className="text-[#8FA3BF]">{t('dockLength')}:</span>
                    <span className="text-white font-mono font-bold">{building.length} m</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="22"
                    value={building.length}
                    onChange={(e) => onUpdateBuilding({ length: parseInt(e.target.value) })}
                    className="w-full accent-[#27D3BC] cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#091526] p-2.5 rounded-lg border border-[#1B3252]">
                  <div className="flex justify-between mb-1">
                    <span className="text-[#8FA3BF]">{t('dockWallHeight')}:</span>
                    <span className="text-white font-mono font-bold">{building.wallHeight} m</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="9"
                    step="0.5"
                    value={building.wallHeight}
                    onChange={(e) => onUpdateBuilding({ wallHeight: parseFloat(e.target.value) })}
                    className="w-full accent-[#27D3BC] cursor-pointer"
                  />
                </div>

                <div className="bg-[#091526] p-2.5 rounded-lg border border-[#1B3252]">
                  <div className="flex justify-between mb-1">
                    <span className="text-[#8FA3BF]">{t('dockRoofPitch')}:</span>
                    <span className="text-[#27D3BC] font-mono font-bold">{building.roofPitch}°</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    value={building.roofPitch}
                    onChange={(e) => onUpdateBuilding({ roofPitch: parseInt(e.target.value) })}
                    className="w-full accent-[#27D3BC] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-[#091526] text-[11px] text-[#8FA3BF]">
                <span>{t('locTotalFootprint')}</span>
                <span className="text-[#27D3BC] font-mono font-bold">
                  {building.width * building.length} m² ({((building.width * building.length) / 4).toFixed(0)} sq.wah)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {selectedPhotoPreview && (
        <div className="fixed inset-0 z-50 bg-[#091526]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#112239] border border-[#1B3252] rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1B3252] pb-3">
              <h4 className="text-sm font-bold text-white truncate max-w-md">
                {selectedPhotoPreview.name}
              </h4>
              <button
                onClick={() => setSelectedPhotoPreview(null)}
                className="text-[#8FA3BF] hover:text-white text-xs px-2 py-1 rounded bg-[#091526]"
              >
                {t('locClose')}
              </button>
            </div>

            <div className="rounded-lg overflow-hidden border border-[#1B3252] bg-[#091526] flex items-center justify-center max-h-[420px]">
              <img
                src={selectedPhotoPreview.url}
                alt={selectedPhotoPreview.name}
                className="w-full h-auto object-contain max-h-[400px]"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#8FA3BF]">
              <span>{selectedPhotoPreview.notes}</span>
              <button
                onClick={() => {
                  onRemovePhoto(selectedPhotoPreview.id);
                  setSelectedPhotoPreview(null);
                }}
                className="text-rose-400 hover:text-rose-300 font-medium"
              >
                {t('locDeletePhoto')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
