# Create a python script that takes a CSV data from a specified path or if path is not specified then from standard input and visualizes the data using mplfinance library.
# The script should generate a candlestick chart fo the given data. The script should also allow the user to specify the title of the chart and the type of the chart (e.g., 'candle', 'ohlc', etc.).
# The format of the CSV data should be as follows:
# `Date,Indicator Name,Open,High,Low,Close,Volume`
# Let the user specify output file name and format (e.g., PNG, PDF) for the generated chart. If not specified, the chart should be displayed on the screen.
import argparse
import sys
import pandas as pd
import mplfinance as mpf

def visualize_data(data, title, chart_type, output_file=None):
    # Convert the 'Date' column to datetime format
    data['Date'] = pd.to_datetime(data['Date'])
    data.set_index('Date', inplace=True)

    # Prepare the data for mplfinance
    ohlc_data = data[['Open', 'High', 'Low', 'Close']]
    volume_data = data['Volume']
    # Create the chart
    if output_file:
        mpf.plot(ohlc_data, type=chart_type, title=title, volume=volume_data, savefig=output_file)
    else:
        mpf.plot(ohlc_data, type=chart_type, title=title, volume=volume_data)

def main():
    parser = argparse.ArgumentParser(description='Visualize CSV data using mplfinance.')
    parser.add_argument('--path', type=str, help='Path to the CSV file. If not specified, data will be read from standard input.')
    parser.add_argument('--title', type=str, default='Candlestick Chart', help='Title of the chart.')
    parser.add_argument('--chart_type', type=str, default='candle', choices=['candle', 'ohlc'], help='Type of the chart (e.g., "candle", "ohlc").')
    parser.add_argument('--output', type=str, help='Output file name and format (e.g., "chart.png", "chart.pdf"). If not specified, the chart will be displayed on the screen.')

    args = parser.parse_args()

    if args.path:
        data = pd.read_csv(args.path)
    else:
        data = pd.read_csv(sys.stdin)

    visualize_data(data, args.title, args.chart_type, args.output)

if __name__ == "__main__":
    main()
