import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator,
  SafeAreaView
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
  
  // Данни за различните графики
  const [completedVsTotal, setCompletedVsTotal] = useState<number[]>([0, 0]);
  const [completionByPeriod, setCompletionByPeriod] = useState<{ labels: string[], data: number[] }>({ 
    labels: [], 
    data: [] 
  });
  const [tasksByPriority, setTasksByPriority] = useState<{ name: string, count: number, color: string }[]>([]);
  const [activityHeatmap, setActivityHeatmap] = useState<{ date: string, count: number }[]>([]);
  
  // Изчисляване на статистиките
  useEffect(() => {
    setLoading(true);
    
    // Асинхронно изчисляване на статистики (симулирано забавяне)
    setTimeout(() => {
      calculateStatistics();
      setLoading(false);
    }, 500);
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
    
    setCompletionByPeriod({ labels, data });
  };
  
  // Задачи по приоритет
  const calculateTasksByPriority = () => {
    const high = todos.filter(todo => todo.priority === 'high').length;
    const medium = todos.filter(todo => todo.priority === 'medium').length;
    const low = todos.filter(todo => todo.priority === 'low').length;
    
    setTasksByPriority([
      { name: 'Висок', count: high, color: getColor('error') },
      { name: 'Среден', count: medium, color: getColor('warning') },
      { name: 'Нисък', count: low, color: getColor('success') }
    ]);
  };
  
  // Активност по дни (heatmap)
  const calculateActivityHeatmap = () => {
    const activityData: { date: string, count: number }[] = [];
    const today = new Date();
    
    // За последните 3 месеца
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Брой задачи, променени на този ден
      const count = todos.filter(todo => {
        const updated = new Date(todo.updatedAt);
        return updated >= dayStart && updated <= dayEnd;
      }).length;
      
      if (count > 0) {
        activityData.push({ date: dateStr, count });
      }
    }
    
    setActivityHeatmap(activityData);
  };
  
  // Изчисляване на процента на завършените задачи
  const calculateCompletionPercentage = (): number => {
    if (todos.length === 0) return 0;
    const completed = todos.filter(todo => todo.completed).length;
    return Math.round((completed / todos.length) * 100);
  };
  
  // Най-продуктивен ден от седмицата
  const getMostProductiveDay = (): string => {
    if (todos.length === 0) return 'Няма данни';
    
    const daysCount = [0, 0, 0, 0, 0, 0, 0]; // Нед, Пон, Вт, ...
    
    todos.forEach(todo => {
      if (todo.completed && todo.updatedAt) {
        const day = new Date(todo.updatedAt).getDay();
        daysCount[day]++;
      }
    });
    
    const maxDay = daysCount.indexOf(Math.max(...daysCount));
    const days = ['Неделя', 'Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота'];
    
    return days[maxDay];
  };
  
  // Общо време за завършване на задачи
  const getAverageCompletionTime = (): string => {
    const completedTasks = todos.filter(todo => 
      todo.completed && todo.createdAt && todo.updatedAt
    );
    
    if (completedTasks.length === 0) return 'Няма данни';
    
    let totalHours = 0;
    
    completedTasks.forEach(todo => {
      const created = new Date(todo.createdAt).getTime();
      const completed = new Date(todo.updatedAt).getTime();
      const hours = (completed - created) / (1000 * 60 * 60);
      totalHours += hours;
    });
    
    const avgHours = totalHours / completedTasks.length;
    
    if (avgHours < 24) {
      return `${Math.round(avgHours)} часа`;
    } else {
      const days = Math.round(avgHours / 24);
      return `${days} дни`;
    }
  };
  
  // Рендериране на различни типове графики
  const renderChart = () => {
    const chartConfig = {
      backgroundGradientFrom: getColor('background'),
      backgroundGradientTo: getColor('background'),
      color: (opacity = 1) => `rgba(${theme === 'dark' ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
      strokeWidth: 2,
      barPercentage: 0.5,
      useShadowColorFromDataset: false
    };
    
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={getColor('primary')} />
          <Text style={[styles.loadingText, { color: getColor('text') }]}>
            Изчисляване на статистики...
          </Text>
        </View>
      );
    }
    
    switch (chartType) {
      case 'line':
        return (
          <LineChart
            data={{
              labels: completionByPeriod.labels,
              datasets: [
                {
                  data: completionByPeriod.data,
                  color: (opacity = 1) => getColor('primary'),
                  strokeWidth: 2
                }
              ]
            }}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );
        
      case 'bar':
        return (
          <BarChart
            data={{
              labels: completionByPeriod.labels,
              datasets: [
                {
                  data: completionByPeriod.data
                }
              ]
            }}
            width={width - 32}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => getColor('primary')
            }}
            style={styles.chart}
          />
        );
        
      case 'pie':
        return (
          <PieChart
            data={tasksByPriority.map(item => ({
              name: item.name,
              population: item.count,
              color: item.color,
              legendFontColor: getColor('text'),
              legendFontSize: 12
            }))}
            width={width - 32}
            height={220}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        );
        
      case 'heatmap':
        return (
          <ContributionGraph
            values={activityHeatmap}
            endDate={new Date()}
            numDays={90}
            width={width - 32}
            height={220}
            tooltipDataAttrs={() => ({})}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => getColor('primary')
            }}
            style={styles.chart}
          />
        );
        
      default:
        return null;
    }
  };
  
  // Локална променлива за текущата тема, за да се използва в графиките
  const theme = getColor('background') === '#FFFFFF' ? 'light' : 'dark';
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: getColor('text') }]}>
            Статистика и анализи
          </Text>
        </View>
        
        <View style={[styles.statsCard, { backgroundColor: getColor('background') }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: getColor('primary') }]}>
                {calculateCompletionPercentage()}%
              </Text>
              <Text style={[styles.statLabel, { color: getColor('textLight') }]}>
                завършени
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: getColor('primary') }]}>
                {getMostProductiveDay()}
              </Text>
              <Text style={[styles.statLabel, { color: getColor('textLight') }]}>
                най-продуктивен ден
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: getColor('primary') }]}>
                {getAverageCompletionTime()}
              </Text>
              <Text style={[styles.statLabel, { color: getColor('textLight') }]}>
                средно време
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.chartControlsContainer}>
          <View style={styles.periodSelector}>
            <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
              Период:
            </Text>
            <View style={styles.controls}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  period === 'day' && { backgroundColor: getColor('primary') }
                ]}
                onPress={() => setPeriod('day')}
              >
                <Text 
                  style={[
                    styles.controlButtonText, 
                    { color: period === 'day' ? '#FFFFFF' : getColor('text') }
                  ]}
                >
                  Ден
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  period === 'week' && { backgroundColor: getColor('primary') }
                ]}
                onPress={() => setPeriod('week')}
              >
                <Text 
                  style={[
                    styles.controlButtonText, 
                    { color: period === 'week' ? '#FFFFFF' : getColor('text') }
                  ]}
                >
                  Седмица
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  period === 'month' && { backgroundColor: getColor('primary') }
                ]}
                onPress={() => setPeriod('month')}
              >
                <Text 
                  style={[
                    styles.controlButtonText, 
                    { color: period === 'month' ? '#FFFFFF' : getColor('text') }
                  ]}
                >
                  Месец
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.chartSelector}>
            <Text style={[styles.sectionTitle, { color: getColor('text') }]}>
              Тип графика:
            </Text>
            <View style={styles.controls}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  chartType === 'line' && { backgroundColor: getColor('primary') }
                ]}
                onPress={() => setChartType('line')}
              >
                <MaterialIcons 
                  name="show-chart" 
                  size={16} 
                  color={chartType === 'line' ? '#FFFFFF' : getColor('text')} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  chartType === 'bar' && { backgroundColor: getColor('primary') }
                ]}
                onPress={() => setChartType('bar')}
              >
                <MaterialIcons 
                  name="bar-chart" 
                  size={16} 
                  color={chartType === 'bar' ? '#FFFFFF' : getColor('text')} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  chartType === 'pie' && { backgroundColor: getColor('primary') }
                ]}
                onPress={() => setChartType('pie')}
              >
                <MaterialIcons 
                  name="pie-chart" 
                  size={16} 
                  color={chartType === 'pie' ? '#FFFFFF' : getColor('text')} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  chartType === 'heatmap' && { backgroundColor: getColor('primary') }
                ]}
                onPress={() => setChartType('heatmap')}
              >
                <MaterialIcons 
                  name="grid-on" 
                  size={16} 
                  color={chartType === 'heatmap' ? '#FFFFFF' : getColor('text')} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={[styles.chartContainer, { backgroundColor: getColor('background') }]}>
          {todos.length > 0 ? (
            renderChart()
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons 
                name="assessment" 
                size={64} 
                color={getColor('textLight')} 
              />
              <Text style={[styles.emptyStateText, { color: getColor('textLight') }]}>
                Няма достатъчно данни за генериране на статистика
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={[styles.infoTitle, { color: getColor('text') }]}>
            Полезна информация
          </Text>
          <Text style={[styles.infoText, { color: getColor('textLight') }]}>
            Използвайте статистиката, за да проследите своя напредък и да 
            идентифицирате модели в управлението на вашите задачи.
          </Text>
          <Text style={[styles.infoText, { color: getColor('textLight') }]}>
            Най-продуктивният ви ден е това, което статистиката показва, че сте 
            завършили най-много задачи. Използвайте тази информация, за да 
            планирате по-ефективно седмицата си.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartControlsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  periodSelector: {
    marginBottom: 12,
  },
  chartSelector: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chart: {
    borderRadius: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3F51B5',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default StatisticsScreen; 