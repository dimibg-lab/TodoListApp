import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Image,
  RefreshControl
} from 'react-native';
import { useWeather } from '../context/WeatherContext';
import { useAppTheme } from '../utils/theme';
import { SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

const WeatherScreen: React.FC = () => {
  const { weatherData, loading, error, fetchWeather, lastUpdated } = useWeather();
  const { getColor } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Изпълнява се при първо зареждане на компонента
    if (!weatherData) {
      fetchWeather();
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWeather();
    setRefreshing(false);
  };

  // Форматиране на време
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('bg-BG', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timeString;
    }
  };

  // Форматиране на дата
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bg-BG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Форматиране на последна актуализация
  const getLastUpdatedText = () => {
    if (!lastUpdated) return 'Няма данни за времето на актуализация';
    
    try {
      return `Последна актуализация: ${lastUpdated.toLocaleString('bg-BG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } catch (error) {
      return 'Грешка при форматиране на времето на актуализация';
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: getColor('background') }]}>
        <ActivityIndicator size="large" color={getColor('primary')} />
        <Text style={[styles.loadingText, { color: getColor('textLight') }]}>
          Зареждане на данни за времето...
        </Text>
      </View>
    );
  }

  if (error && !weatherData) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: getColor('background') }]}>
        <Text style={[styles.errorTitle, { color: getColor('error') }]}>Грешка</Text>
        <Text style={[styles.errorText, { color: getColor('text') }]}>
          {error}
        </Text>
      </View>
    );
  }

  if (!weatherData) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: getColor('background') }]}>
        <Text style={[styles.errorTitle, { color: getColor('error') }]}>Няма данни</Text>
        <Text style={[styles.errorText, { color: getColor('text') }]}>
          Не можем да получим информация за времето в момента.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: getColor('background') }]}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[getColor('primary')]}
          tintColor={getColor('primary')}
        />
      }
    >
      {/* Заглавие с местоположение */}
      <View style={styles.locationHeader}>
        <Text style={[styles.locationName, { color: getColor('text') }]}>
          {weatherData.location.name}
        </Text>
        <Text style={[styles.locationRegion, { color: getColor('textLight') }]}>
          {weatherData.location.region}, {weatherData.location.country}
        </Text>
        <Text style={[styles.lastUpdated, { color: getColor('textLight') }]}>
          {getLastUpdatedText()}
        </Text>
      </View>

      {/* Текущо време */}
      <View style={[styles.currentWeatherContainer, { backgroundColor: getColor('surface') }]}>
        <View style={styles.currentWeatherLeft}>
          <Text style={[styles.currentTemp, { color: getColor('text') }]}>
            {Math.round(weatherData.current.temp_c)}°C
          </Text>
          <Text style={[styles.feelsLikeTemp, { color: getColor('textLight') }]}>
            Усеща се като {Math.round(weatherData.current.feelslike_c)}°C
          </Text>
          <Text style={[styles.weatherCondition, { color: getColor('primary') }]}>
            {weatherData.current.condition.text}
          </Text>
        </View>
        
        <View style={styles.currentWeatherRight}>
          {weatherData.current.condition.icon && (
            <Image 
              source={{ uri: `https:${weatherData.current.condition.icon}` }} 
              style={styles.weatherIcon}
            />
          )}
        </View>
      </View>

      {/* Детайли за текущото време */}
      <View style={[styles.detailsContainer, { backgroundColor: getColor('surface') }]}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: getColor('textLight') }]}>Вятър</Text>
          <Text style={[styles.detailValue, { color: getColor('text') }]}>
            {weatherData.current.wind_kph} км/ч ({weatherData.current.wind_dir})
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: getColor('textLight') }]}>Влажност</Text>
          <Text style={[styles.detailValue, { color: getColor('text') }]}>
            {weatherData.current.humidity}%
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: getColor('textLight') }]}>Облачност</Text>
          <Text style={[styles.detailValue, { color: getColor('text') }]}>
            {weatherData.current.cloud}%
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: getColor('textLight') }]}>UV Индекс</Text>
          <Text style={[styles.detailValue, { color: getColor('text') }]}>
            {weatherData.current.uv}
          </Text>
        </View>
      </View>

      {/* Прогноза по часове */}
      {weatherData.forecast && weatherData.forecast.forecastday && weatherData.forecast.forecastday.length > 0 && (
        <View style={styles.forecastSection}>
          <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
            Прогноза по часове
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.hourlyForecastContainer}
          >
            {weatherData.forecast.forecastday[0].hour.map((hour, index) => {
              const hourTime = new Date(hour.time);
              const now = new Date();
              // Показваме само бъдещи часове
              if (hourTime < now && index < weatherData.forecast.forecastday[0].hour.length - 1) {
                return null;
              }
              
              return (
                <View 
                  key={index} 
                  style={[styles.hourlyItem, { backgroundColor: getColor('surface') }]}
                >
                  <Text style={[styles.hourlyTime, { color: getColor('textLight') }]}>
                    {formatTime(hour.time)}
                  </Text>
                  
                  <Image 
                    source={{ uri: `https:${hour.condition.icon}` }} 
                    style={styles.hourlyIcon}
                  />
                  
                  <Text style={[styles.hourlyTemp, { color: getColor('text') }]}>
                    {Math.round(hour.temp_c)}°C
                  </Text>
                  
                  <Text style={[styles.hourlyCondition, { color: getColor('primary') }]}>
                    {hour.condition.text}
                  </Text>
                  
                  <Text style={[styles.hourlyRain, { color: getColor('textLight') }]}>
                    {hour.chance_of_rain}% дъжд
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 3-дневна прогноза */}
      {weatherData.forecast && weatherData.forecast.forecastday && weatherData.forecast.forecastday.length > 0 && (
        <View style={styles.forecastSection}>
          <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
            3-дневна прогноза
          </Text>
          
          {weatherData.forecast.forecastday.map((day, index) => (
            <View 
              key={index} 
              style={[styles.dailyItem, { backgroundColor: getColor('surface') }]}
            >
              <View style={styles.dailyLeft}>
                <Text style={[styles.dailyDate, { color: getColor('textLight') }]}>
                  {formatDate(day.date)}
                </Text>
                
                <Text style={[styles.dailyCondition, { color: getColor('text') }]}>
                  {day.day.condition.text}
                </Text>
                
                <Text style={[styles.dailyDetails, { color: getColor('textLight') }]}>
                  Влажност: {day.day.avghumidity}% | Валежи: {day.day.totalrecip_mm} мм
                </Text>
              </View>
              
              <View style={styles.dailyRight}>
                <Image 
                  source={{ uri: `https:${day.day.condition.icon}` }} 
                  style={styles.dailyIcon}
                />
                
                <Text style={[styles.dailyTemp, { color: getColor('text') }]}>
                  {Math.round(day.day.maxtemp_c)}°/{Math.round(day.day.mintemp_c)}°
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Информация за изгрев и залез */}
      {weatherData.forecast && weatherData.forecast.forecastday && weatherData.forecast.forecastday.length > 0 && (
        <View style={[styles.sunInfoContainer, { backgroundColor: getColor('surface') }]}>
          <Text style={[styles.sunInfoTitle, { color: getColor('text') }]}>
            Слънце
          </Text>
          
          <View style={styles.sunInfoRow}>
            <View style={styles.sunInfoItem}>
              <Text style={[styles.sunInfoLabel, { color: getColor('textLight') }]}>
                Изгрев
              </Text>
              <Text style={[styles.sunInfoValue, { color: getColor('text') }]}>
                {weatherData.forecast.forecastday[0].astro.sunrise}
              </Text>
            </View>
            
            <View style={styles.sunInfoItem}>
              <Text style={[styles.sunInfoLabel, { color: getColor('textLight') }]}>
                Залез
              </Text>
              <Text style={[styles.sunInfoValue, { color: getColor('text') }]}>
                {weatherData.forecast.forecastday[0].astro.sunset}
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.m,
    fontSize: FONT_SIZE.m,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.m,
  },
  errorTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.m,
  },
  errorText: {
    fontSize: FONT_SIZE.m,
    textAlign: 'center',
  },
  locationHeader: {
    padding: SPACING.m,
    alignItems: 'center',
  },
  locationName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  locationRegion: {
    fontSize: FONT_SIZE.m,
    marginBottom: SPACING.s,
  },
  lastUpdated: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  currentWeatherContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    margin: SPACING.m,
    padding: SPACING.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentWeatherLeft: {
    flex: 2,
  },
  currentWeatherRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentTemp: {
    fontSize: 48,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  feelsLikeTemp: {
    fontSize: FONT_SIZE.m,
  },
  weatherCondition: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.medium as any,
    marginTop: SPACING.s,
  },
  weatherIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 12,
    margin: SPACING.m,
    padding: SPACING.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailItem: {
    width: '50%',
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONT_SIZE.xs,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  forecastSection: {
    margin: SPACING.m,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.bold as any,
    marginBottom: SPACING.m,
  },
  hourlyForecastContainer: {
    flexDirection: 'row',
  },
  hourlyItem: {
    alignItems: 'center',
    borderRadius: 12,
    padding: SPACING.m,
    marginRight: SPACING.s,
    width: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  hourlyTime: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.xs,
  },
  hourlyIcon: {
    width: 40,
    height: 40,
    marginVertical: SPACING.xs,
  },
  hourlyTemp: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  hourlyCondition: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    marginVertical: SPACING.xs,
  },
  hourlyRain: {
    fontSize: FONT_SIZE.xs,
  },
  dailyItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: SPACING.m,
    marginBottom: SPACING.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dailyLeft: {
    flex: 3,
  },
  dailyRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyDate: {
    fontSize: FONT_SIZE.m,
    marginBottom: SPACING.xs,
  },
  dailyCondition: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
    marginBottom: SPACING.xs,
  },
  dailyDetails: {
    fontSize: FONT_SIZE.xs,
  },
  dailyIcon: {
    width: 40,
    height: 40,
    marginBottom: SPACING.xs,
  },
  dailyTemp: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
  },
  sunInfoContainer: {
    borderRadius: 12,
    margin: SPACING.m,
    padding: SPACING.m,
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sunInfoTitle: {
    fontSize: FONT_SIZE.l,
    fontWeight: FONT_WEIGHT.medium as any,
    marginBottom: SPACING.s,
  },
  sunInfoRow: {
    flexDirection: 'row',
  },
  sunInfoItem: {
    flex: 1,
  },
  sunInfoLabel: {
    fontSize: FONT_SIZE.xs,
    marginBottom: 2,
  },
  sunInfoValue: {
    fontSize: FONT_SIZE.m,
    fontWeight: FONT_WEIGHT.medium as any,
  },
});

export default WeatherScreen; 