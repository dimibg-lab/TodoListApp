import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Easing
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';
import { useTodo } from '../context/TodoContext';
import { TodoItem } from '../types/todo';
import { 
  LineChart, 
  BarChart, 
  PieChart, 
  ContributionGraph 
} from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// Типове за периоди и видове графики
type PeriodType = 'day' | 'week' | 'month';
type ChartType = 'line' | 'bar' | 'pie' | 'heatmap';

const StatisticsScreen = () => {
  const { todos } = useTodo();
  const { getColor } = useAppTheme();
  const [period, setPeriod] = useState<PeriodType>('week');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const chartAnimValue = useRef(new Animated.Value(0)).current;
  
  // Данни за различните графики
  const [completedVsTotal, setCompletedVsTotal] = useState<number[]>([0, 0]);
  const [completionByPeriod, setCompletionByPeriod] = useState<{ labels: string[], data: number[] }>({ 
    labels: [], 
    data: [] 
  });
  const [tasksByPriority, setTasksByPriority] = useState<{ name: string, count: number, color: string }[]>([]);
  const [activityHeatmap, setActivityHeatmap] = useState<{ date: string, count: number }[]>([]);
  
  // Кеш за данните по периоди
  const cachedData = useRef<{
    [key in PeriodType]: {
      completionByPeriod: { labels: string[], data: number[] },
      activityHeatmap: { date: string, count: number }[]
    }
  }>({
    day: { completionByPeriod: { labels: [], data: [] }, activityHeatmap: [] },
    week: { completionByPeriod: { labels: [], data: [] }, activityHeatmap: [] },
    month: { completionByPeriod: { labels: [], data: [] }, activityHeatmap: [] }
  }).current;
  
  // Стартиране на входящите анимации
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Анимация при промяна на графика
  useEffect(() => {
    Animated.timing(chartAnimValue, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      chartAnimValue.setValue(0);
    });
  }, [chartType, period]);
  
  // Изчисляване на статистиките
  useEffect(() => {
    setLoading(true);
    
    // Проверка дали имаме кеширани данни
    if (cachedData[period].completionByPeriod.labels.length > 0) {
      setCompletionByPeriod(cachedData[period].completionByPeriod);
      setActivityHeatmap(cachedData[period].activityHeatmap);
      calculateCompletedVsTotal();
      calculateTasksByPriority();
      setLoading(false);
    } else {
      // Асинхронно изчисляване на статистики
      setTimeout(() => {
        calculateStatistics();
        setLoading(false);
      }, 300);
    }
  }, [todos, period]);
  
  // Изчисляване на всички статистики
  const calculateStatistics = () => {
    calculateCompletedVsTotal();
    calculateCompletionByPeriod();
    calculateTasksByPriority();
    calculateActivityHeatmap();
  };
  
  // Процент завършени спрямо общия брой задачи
  const calculateCompletedVsTotal = () => {
    const completed = todos.filter(todo => todo.completed).length;
    const total = todos.length;
    setCompletedVsTotal([completed, total - completed]);
  };
  
  // Броят на завършените задачи за определен период (ден, седмица, месец)
  const calculateCompletionByPeriod = () => {
    const now = new Date();
    const labels: string[] = [];
    const data: number[] = [];
    
    if (period === 'day') {
      // Последните 7 дни
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const dayStr = date.toLocaleDateString('bg-BG', { weekday: 'short' });
        labels.push(dayStr);
        
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const completed = todos.filter(todo => 
          todo.completed && 
          new Date(todo.updatedAt) >= dayStart && 
          new Date(todo.updatedAt) <= dayEnd
        ).length;
        
        data.push(completed);
      }
    } else if (period === 'week') {
      // Последните 4 седмици
      for (let i = 3; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        
        const weekStart = new Date(date);
        // Настройка на началото на седмицата (понеделник)
        weekStart.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
        labels.push(weekLabel);
        
        const completed = todos.filter(todo => 
          todo.completed && 
          new Date(todo.updatedAt) >= weekStart && 
          new Date(todo.updatedAt) <= weekEnd
        ).length;
        
        data.push(completed);
      }
    } else if (period === 'month') {
      // Последните 6 месеца
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        
        const monthStr = date.toLocaleDateString('bg-BG', { month: 'short' });
        labels.push(monthStr);
        
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        
        const completed = todos.filter(todo => 
          todo.completed && 
          new Date(todo.updatedAt) >= monthStart && 
          new Date(todo.updatedAt) <= monthEnd
        ).length;
        
        data.push(completed);
      }
    }
    
    const result = { labels, data };
    setCompletionByPeriod(result);
    
    // Запазване в кеша
    cachedData[period].completionByPeriod = result;
  };
  
  // Разпределение на задачите по приоритет
  const calculateTasksByPriority = () => {
    const highPriority = todos.filter(todo => todo.priority === 'high').length;
    const mediumPriority = todos.filter(todo => todo.priority === 'medium').length;
    const lowPriority = todos.filter(todo => todo.priority === 'low').length;
    
    setTasksByPriority([
      { name: 'Висок', count: highPriority, color: getColor('priorityHigh') },
      { name: 'Среден', count: mediumPriority, color: getColor('priorityMedium') },
      { name: 'Нисък', count: lowPriority, color: getColor('priorityLow') },
    ]);
  };
  
  // Данни за топлинната карта на активността
  const calculateActivityHeatmap = () => {
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'day') {
      // Последните 30 дни
      startDate.setDate(now.getDate() - 30);
    } else if (period === 'week') {
      // Последните 90 дни
      startDate.setDate(now.getDate() - 90);
    } else {
      // Последната година
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    const result: { date: string, count: number }[] = [];
    
    todos.forEach(todo => {
      if (todo.completed && todo.updatedAt) {
        const completedDate = new Date(todo.updatedAt);
        
        if (completedDate >= startDate && completedDate <= now) {
          const dateStr = completedDate.toISOString().split('T')[0];
          
          const existingEntry = result.find(entry => entry.date === dateStr);
          if (existingEntry) {
            existingEntry.count++;
          } else {
            result.push({ date: dateStr, count: 1 });
          }
        }
      }
    });
    
    setActivityHeatmap(result);
    
    // Запазване в кеша
    cachedData[period].activityHeatmap = result;
  };
  
  // Изчисляване на процента завършени задачи
  const calculateCompletionPercentage = (): number => {
    if (todos.length === 0) return 0;
    // Използване на Math.min за предотвратяване на стойности над 100%
    return Math.min(100, Math.round((completedVsTotal[0] / todos.length) * 100));
  };
  
  // Най-продуктивен ден
  const getMostProductiveDay = (): string => {
    if (completionByPeriod.data.length === 0) return 'Няма данни';
    
    const maxIndex = completionByPeriod.data.indexOf(Math.max(...completionByPeriod.data));
    if (maxIndex === -1 || completionByPeriod.data[maxIndex] === 0) return 'Няма данни';
    
    return completionByPeriod.labels[maxIndex];
  };
  
  // Средно време за изпълнение
  const getAverageCompletionTime = (): string => {
    const completedTodos = todos.filter(todo => 
      todo.completed && todo.createdAt && todo.updatedAt
    );
    
    if (completedTodos.length === 0) return 'Няма данни';
    
    const totalTimeMs = completedTodos.reduce((sum, todo) => {
      const createdDate = new Date(todo.createdAt);
      const completedDate = new Date(todo.updatedAt);
      return sum + (completedDate.getTime() - createdDate.getTime());
    }, 0);
    
    const avgTimeMs = totalTimeMs / completedTodos.length;
    const avgDays = Math.floor(avgTimeMs / (1000 * 60 * 60 * 24));
    
    if (avgDays > 0) {
      return `${avgDays} ${avgDays === 1 ? 'ден' : 'дни'}`;
    } else {
      const avgHours = Math.floor(avgTimeMs / (1000 * 60 * 60));
      if (avgHours > 0) {
        return `${avgHours} ${avgHours === 1 ? 'час' : 'часа'}`;
      } else {
        const avgMinutes = Math.floor(avgTimeMs / (1000 * 60));
        return `${avgMinutes} ${avgMinutes === 1 ? 'минута' : 'минути'}`;
      }
    }
  };
  
  // Общи настройки за графиките
  const chartConfig = useMemo(() => ({
    backgroundGradientFrom: getColor('background'),
    backgroundGradientTo: getColor('background'),
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${hexToRgb(getColor('primary'))}, ${opacity})`,
    labelColor: (opacity = 1) => getColor('text'),
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: getColor('primary'),
    },
  }), [getColor]);
  
  // Помощна функция за конвертиране на хекс цвят към RGB
  const hexToRgb = (hex: string): string => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const formattedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
    if (!result) return '0, 0, 0';
    
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  };
  
  // Рендериране на графиките
  const renderChart = () => {
    const chartStyle = {
      marginVertical: 8,
      borderRadius: 16,
      padding: 10,
      backgroundColor: getColor('surface'),
      shadowColor: getColor('text'),
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    };
    
    const chartWidth = width - 40;
    const chartHeight = 220;
    
    // Проверка за празни данни
    const hasData = completionByPeriod.data.some(value => value > 0) || 
                   tasksByPriority.some(item => item.count > 0) ||
                   activityHeatmap.length > 0;
    
    if (!hasData) {
      return (
        <Animated.View style={[chartStyle, { opacity: fadeAnim, justifyContent: 'center', alignItems: 'center', height: chartHeight }]}>
          <MaterialIcons 
            name="insert-chart" 
            size={48} 
            color={getColor('textLight')} 
          />
          <Text style={[styles.chartTitle, { color: getColor('text'), marginTop: 12 }]}>
            Няма достатъчно данни за показване на графика
          </Text>
        </Animated.View>
      );
    }
    
    // Анимация за графиките
    const translateY = chartAnimValue.interpolate({
      inputRange: [0, 1],
      outputRange: [10, 0]
    });
    
    const opacity = chartAnimValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });
    
    // Подготовка на данните - защита от невалидни стойности
    const safeData = completionByPeriod.data.map(value => 
      isFinite(value) ? value : 0
    );
    
    // Показване на различни видове графики
    if (chartType === 'line') {
      // Проверка дали има поне една ненулева стойност
      const hasValidData = safeData.some(value => value > 0);
      if (!hasValidData) {
        return (
          <Animated.View style={[chartStyle, { opacity, transform: [{ translateY }], justifyContent: 'center', alignItems: 'center', height: chartHeight }]}>
            <MaterialIcons 
              name="timeline" 
              size={48} 
              color={getColor('textLight')} 
            />
            <Text style={[styles.chartTitle, { color: getColor('text'), marginTop: 12 }]}>
              Няма данни за линейната графика
            </Text>
          </Animated.View>
        );
      }
      
      return (
        <Animated.View style={[chartStyle, { opacity, transform: [{ translateY }] }]}>
          <Text style={[styles.chartTitle, { color: getColor('text') }]}>
            Завършени задачи във времето
          </Text>
          <LineChart
            data={{
              labels: completionByPeriod.labels,
              datasets: [{ data: safeData }]
            }}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
        </Animated.View>
      );
    } else if (chartType === 'bar') {
      // Проверка дали има поне една ненулева стойност
      const hasValidData = safeData.some(value => value > 0);
      if (!hasValidData) {
        return (
          <Animated.View style={[chartStyle, { opacity, transform: [{ translateY }], justifyContent: 'center', alignItems: 'center', height: chartHeight }]}>
            <MaterialIcons 
              name="bar-chart" 
              size={48} 
              color={getColor('textLight')} 
            />
            <Text style={[styles.chartTitle, { color: getColor('text'), marginTop: 12 }]}>
              Няма данни за колонната графика
            </Text>
          </Animated.View>
        );
      }
      
      return (
        <Animated.View style={[chartStyle, { opacity, transform: [{ translateY }] }]}>
          <Text style={[styles.chartTitle, { color: getColor('text') }]}>
            Завършени задачи по период
          </Text>
          <BarChart
            data={{
              labels: completionByPeriod.labels,
              datasets: [{ data: safeData }]
            }}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            style={{ borderRadius: 16 }}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </Animated.View>
      );
    } else if (chartType === 'pie') {
      // Филтриране на нулеви стойности за кръговата диаграма
      const validPriorityData = tasksByPriority.filter(item => item.count > 0);
      
      if (validPriorityData.length === 0) {
        return (
          <Animated.View style={[chartStyle, { opacity, transform: [{ translateY }], justifyContent: 'center', alignItems: 'center', height: chartHeight }]}>
            <MaterialIcons 
              name="pie-chart" 
              size={48} 
              color={getColor('textLight')} 
            />
            <Text style={[styles.chartTitle, { color: getColor('text'), marginTop: 12 }]}>
              Няма данни за кръговата графика
            </Text>
          </Animated.View>
        );
      }
      
      const chartData = validPriorityData.map(item => ({
        name: item.name,
        count: isFinite(item.count) ? item.count : 0,
        color: item.color,
        legendFontColor: getColor('text'),
        legendFontSize: 13
      }));
      
      return (
        <Animated.View style={[chartStyle, { opacity, transform: [{ translateY }] }]}>
          <Text style={[styles.chartTitle, { color: getColor('text') }]}>
            Разпределение по приоритет
          </Text>
          <PieChart
            data={chartData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Animated.View>
      );
    } else if (chartType === 'heatmap') {
      if (activityHeatmap.length === 0) {
        return (
          <Animated.View style={[chartStyle, { opacity, transform: [{ translateY }], justifyContent: 'center', alignItems: 'center', height: chartHeight }]}>
            <MaterialIcons 
              name="grid-on" 
              size={48} 
              color={getColor('textLight')} 
            />
            <Text style={[styles.chartTitle, { color: getColor('text'), marginTop: 12 }]}>
              Няма данни за топлинната карта
            </Text>
          </Animated.View>
        );
      }
      
      // Филтриране на невалидни стойности за топлинната карта
      const safeHeatmapData = activityHeatmap
        .filter(item => item.date && isFinite(item.count))
        .map(item => ({
          date: item.date,
          count: Math.max(0, item.count) // Предотвратяване на отрицателни стойности
        }));
      
      return (
        <Animated.View style={[chartStyle, { opacity, transform: [{ translateY }] }]}>
          <Text style={[styles.chartTitle, { color: getColor('text') }]}>
            Активност по дни
          </Text>
          <ContributionGraph
            values={safeHeatmapData}
            endDate={new Date()}
            numDays={period === 'day' ? 30 : period === 'week' ? 90 : 365}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            style={{ borderRadius: 16 }}
            tooltipDataAttrs={() => ({})}
          />
        </Animated.View>
      );
    }
    
    return null;
  };
  
  // Рендериране на секция със сумарна статистика
  const renderSummary = () => {
    return (
      <Animated.View 
        style={[
          styles.summaryContainer, 
          { 
            backgroundColor: getColor('surface'),
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            shadowColor: getColor('text')
          }
        ]}
      >
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: getColor('primary') }]}>
            {calculateCompletionPercentage()}%
          </Text>
          <Text style={[styles.summaryLabel, { color: getColor('textLight') }]}>
            Завършени
          </Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: getColor('primary') }]}>
            {getMostProductiveDay()}
          </Text>
          <Text style={[styles.summaryLabel, { color: getColor('textLight') }]}>
            Най-продуктивен ден
          </Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: getColor('primary') }]}>
            {getAverageCompletionTime()}
          </Text>
          <Text style={[styles.summaryLabel, { color: getColor('textLight') }]}>
            Средно време
          </Text>
        </View>
      </Animated.View>
    );
  };
  
  // Рендериране на бутоните за превключване на периода
  const renderPeriodButtons = () => {
    return (
      <Animated.View 
        style={[
          styles.buttonsContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <Text style={[styles.filterTitle, { color: getColor('text') }]}>Период:</Text>
        <View style={styles.periodButtons}>
          {(['day', 'week', 'month'] as PeriodType[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.periodButton,
                period === p && { 
                  backgroundColor: getColor('primary'),
                  shadowColor: getColor('primary'),
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 3
                }
              ]}
              onPress={() => setPeriod(p)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  { color: period === p ? '#FFFFFF' : getColor('text') }
                ]}
              >
                {p === 'day' ? 'Ден' : p === 'week' ? 'Седмица' : 'Месец'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };
  
  // Рендериране на бутоните за превключване на вида графика
  const renderChartTypeButtons = () => {
    return (
      <Animated.View 
        style={[
          styles.chartTypeContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <Text style={[styles.filterTitle, { color: getColor('text') }]}>Тип графика:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartTypeButtons}
        >
          {([
            { type: 'line', icon: 'show-chart', label: 'Линейна' },
            { type: 'bar', icon: 'bar-chart', label: 'Колонна' },
            { type: 'pie', icon: 'pie-chart', label: 'Кръгова' },
            { type: 'heatmap', icon: 'grid-on', label: 'Топлинна' }
          ] as { type: ChartType, icon: string, label: string }[]).map((item) => (
            <TouchableOpacity
              key={item.type}
              style={[
                styles.chartTypeButton,
                chartType === item.type && { 
                  backgroundColor: getColor('primary'),
                  shadowColor: getColor('primary'),
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 3
                }
              ]}
              onPress={() => setChartType(item.type)}
            >
              <MaterialIcons 
                name={item.icon as any} 
                size={18} 
                color={chartType === item.type ? '#FFFFFF' : getColor('primary')} 
              />
              <Text
                style={[
                  styles.chartTypeButtonText,
                  { color: chartType === item.type ? '#FFFFFF' : getColor('text') }
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Заглавие */}
        <Animated.Text 
          style={[
            styles.title, 
            { 
              color: getColor('text'),
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          Статистика и анализи
        </Animated.Text>
        
        {/* Обобщена статистика */}
        {renderSummary()}
        
        {/* Филтри за период */}
        {renderPeriodButtons()}
        
        {/* Избор на тип графика */}
        {renderChartTypeButtons()}
        
        {/* Визуализация на данните */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={getColor('primary')} />
            <Text style={[styles.loadingText, { color: getColor('textLight') }]}>
              Изчисляване на статистики...
            </Text>
          </View>
        ) : (
          renderChart()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40, // По-голям padding отгоре
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as any,
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 10,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold' as any,
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '500' as any,
    marginBottom: 10,
  },
  periodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500' as any,
  },
  chartTypeContainer: {
    marginBottom: 20,
  },
  chartTypeButtons: {
    paddingVertical: 5,
  },
  chartTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  chartTypeButtonText: {
    fontSize: 14,
    fontWeight: '500' as any,
    marginLeft: 5,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500' as any,
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default StatisticsScreen; 