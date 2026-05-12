import { ComponentType } from 'react';
import GraphWidget from './GraphWidget';
import DataChartWidget from './DataChartWidget';
import AnnotatedTextWidget from './AnnotatedTextWidget';
import DiagramWidget from './DiagramWidget';

// Add new widgets here — the interceptor picks them up automatically
export const WidgetRegistry: Record<string, ComponentType<any>> = {
  GraphWidget,
  DataChartWidget,
  AnnotatedTextWidget,
  DiagramWidget,
};
