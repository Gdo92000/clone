import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { Icon } from '../ui/Icon';
import { useLocationContext } from '../../context/LocationContext';
import { getRegisteredCityCoverages } from '../../services/cityCoverageService';
import { formatDistance } from '../../services/locationService';

interface LocationSelectorProps {
  className?: string;
}

function RequestingState({ className }: { className?: string }) {
  return (
    <div className={clsx('space-y-3', className)}>
      <div className="p-4 rounded-xl bg-surface-background border border-border-default">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-sm text-text-secondary">Detectando sua localização...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnsupportedCityState({
  city,
  onSelectCity,
  className,
}: {
  city: { name: string };
  onSelectCity: () => void;
  className?: string;
}) {
  return (
    <div className={clsx('space-y-3', className)}>
      <div className="p-4 rounded-xl bg-feedback-warning/10 border border-feedback-warning/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-feedback-warning/20 flex items-center justify-center shrink-0">
            <Icon name="Info" className="text-feedback-warning" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-text-primary">
              Você está em {city.name}, mas ainda não entregamos nessa região
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Nao temos estabelecimento cadastrado em &quot;{city.name}&quot;.
            </p>
            <button
              onClick={onSelectCity}
              className="mt-3 px-4 py-2 rounded-lg font-medium text-sm border border-border-default text-text-primary hover:bg-surface-background transition-colors"
            >
              Ver cidades com cadastro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportedCityState({
  city,
  distanceToCityCenter,
  onEdit,
  className,
}: {
  city: { name: string; state: string; stateCode?: string; neighborhood?: string };
  distanceToCityCenter: number | null;
  onEdit: () => void;
  className?: string;
}) {
  return (
    <div className={clsx('flex items-center gap-2 p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/20', className)}>
      <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
        <Icon name="MapPin" className="text-brand-primary" size={16} />
      </div>
      <div className="flex-1 min-w-0">
        {city.neighborhood && (
          <p className="text-sm font-medium text-text-primary truncate">
            {city.neighborhood}
          </p>
        )}
        <p className={clsx(city.neighborhood ? 'text-xs text-text-secondary' : 'text-sm font-medium text-text-primary truncate')}>
          {city.name} - {city.stateCode ?? city.state}
        </p>
        {distanceToCityCenter !== null && !city.neighborhood && (
          <p className="text-xs text-text-secondary">
            {formatDistance(distanceToCityCenter)} do centro
          </p>
        )}
      </div>
      <button
        onClick={onEdit}
        className="p-2 rounded-lg hover:bg-surface-background transition-colors"
        title="Trocar localização"
      >
        <Icon name="Pen" className="text-text-secondary" size={16} />
      </button>
    </div>
  );
}

function CitySelectionModal({
  searchCity,
  onSearchChange,
  filteredCities,
  onCitySelect,
  onClose,
}: {
  searchCity: string;
  onSearchChange: (v: string) => void;
  filteredCities: { name: string; state: string }[];
  onCitySelect: (name: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface-elevated rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-border-default">
          <input
            type="text"
            value={searchCity}
            onChange={(e) => { onSearchChange(e.target.value); }}
            placeholder="Buscar cidade..."
            className="w-full h-11 px-4 rounded-lg bg-surface-background border border-border-default text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-focus"
            autoFocus
          />
        </div>
        <div className="overflow-y-auto max-h-64">
          {filteredCities.map((c) => (
            <button
              key={c.name}
              onClick={() => { onCitySelect(c.name); }}
              className="w-full p-4 text-left hover:bg-surface-background transition-colors border-b border-border-default"
            >
              <span className="font-medium text-text-primary">{c.name}</span>
              <span className="text-text-secondary text-sm ml-2">- {c.state}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-border-default">
          <button
            onClick={onClose}
            className="w-full py-2 text-text-secondary hover:text-text-primary"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function IdleState({
  loading,
  requestLocation,
  onSelectCity,
  showCityList,
  searchCity,
  onSearchChange,
  filteredCities,
  onCitySelect,
  onCloseCityList,
  className,
}: {
  loading: boolean;
  requestLocation: () => void;
  onSelectCity: () => void;
  showCityList: boolean;
  searchCity: string;
  onSearchChange: (v: string) => void;
  filteredCities: { name: string; state: string }[];
  onCitySelect: (name: string) => void;
  onCloseCityList: () => void;
  className?: string;
}) {
  return (
    <div className={clsx('space-y-3', className)}>
      <div className="p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
            <Icon name="Info" className="text-brand-primary" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-text-primary">
              Ative sua localização
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Precisamos saber sua localização para mostrar os restaurantes próximos de você.
            </p>
            <button
              onClick={requestLocation}
              disabled={loading}
              className={clsx(
                'mt-3 px-4 py-2 rounded-lg font-medium text-sm',
                'bg-brand-primary text-text-inverse',
                'hover:bg-brand-primary-hover transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {loading ? 'Buscando...' : 'Ativar localização'}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-text-secondary mb-2">ou</p>
        <button
          onClick={onSelectCity}
          className="text-sm text-brand-primary hover:text-brand-primary-hover font-medium"
        >
          Selecionar cidade manualmente
        </button>
      </div>

      {showCityList && (
        <CitySelectionModal
          searchCity={searchCity}
          onSearchChange={onSearchChange}
          filteredCities={filteredCities}
          onCitySelect={onCitySelect}
          onClose={onCloseCityList}
        />
      )}
    </div>
  );
}

function WarningState({
  iconName,
  title,
  description,
  loading,
  requestLocation,
  onSelectCity,
  className,
}: {
  iconName: string;
  title: string;
  description: string | React.ReactNode;
  loading: boolean;
  requestLocation: () => void;
  onSelectCity: () => void;
  className?: string;
}) {
  return (
    <div className={clsx('space-y-3', className)}>
      <div className="p-4 rounded-xl bg-feedback-warning/10 border border-feedback-warning/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-feedback-warning/20 flex items-center justify-center shrink-0">
            <Icon name={iconName} className="text-feedback-warning" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-text-primary">{title}</h3>
            <div className="text-sm text-text-secondary mt-1">{description}</div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={requestLocation}
                disabled={loading}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-brand-primary text-text-inverse hover:bg-brand-primary-hover transition-colors disabled:opacity-50"
              >
                {loading ? 'Buscando...' : 'Tentar novamente'}
              </button>
              <button
                onClick={onSelectCity}
                className="px-4 py-2 rounded-lg font-medium text-sm border border-border-default text-text-primary hover:bg-surface-background transition-colors"
              >
                Selecionar cidade
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LocationSelector({ className }: LocationSelectorProps) {
  const {
    city,
    isWithinSupportedCity,
    distanceToCityCenter,
    loading,
    error,
    status,
    requestLocation,
    setManualCity,
  } = useLocationContext();

  const [showCityList, setShowCityList] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [registeredCities, setRegisteredCities] = useState<Awaited<ReturnType<typeof getRegisteredCityCoverages>>>([]);

  useEffect(() => {
    void getRegisteredCityCoverages().then(setRegisteredCities);
  }, []);

  const filteredCities = registeredCities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCity.toLowerCase()) ||
      c.state.toLowerCase().includes(searchCity.toLowerCase())
  );

  const handleCitySelect = (cityName: string) => {
    setManualCity(cityName);
    setShowCityList(false);
    setSearchCity('');
  };

  const spreadCn = className ? { className } : {};

  if (status === 'REQUESTING') {
    return <RequestingState {...spreadCn} />;
  }

  if (status === 'DENIED' && !city) {
    return (
      <WarningState
        iconName="MapPinOff"
        title="Localização desativada"
        description="Permita o acesso ? localização no navegador ou selecione manualmente."
        loading={loading}
        requestLocation={requestLocation}
        onSelectCity={() => { setShowCityList(true); }}
        {...spreadCn}
      />
    );
  }

  if (error && !city) {
    return (
      <WarningState
        iconName="AlertTriangle"
        title="Não foi possível detectar sua localização"
        description={error}
        loading={loading}
        requestLocation={requestLocation}
        onSelectCity={() => { setShowCityList(true); }}
        {...spreadCn}
      />
    );
  }

  if (city && !isWithinSupportedCity) {
    return (
      <UnsupportedCityState
        city={city}
        onSelectCity={() => { setShowCityList(true); }}
        {...spreadCn}
      />
    );
  }

  if (city && isWithinSupportedCity) {
    return (
      <SupportedCityState
        city={city}
        distanceToCityCenter={distanceToCityCenter}
        onEdit={() => { setShowCityList(true); }}
        {...spreadCn}
      />
    );
  }

  if (status === 'IDLE') {
    return (
      <IdleState
        loading={loading}
        requestLocation={requestLocation}
        onSelectCity={() => { setShowCityList(true); }}
        showCityList={showCityList}
        searchCity={searchCity}
        onSearchChange={setSearchCity}
        filteredCities={filteredCities}
        onCitySelect={handleCitySelect}
        onCloseCityList={() => { setShowCityList(false); setSearchCity(''); }}
        {...spreadCn}
      />
    );
  }

  return null;
}
