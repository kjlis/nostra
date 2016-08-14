import glob
import numpy as np
import pandas as pd

csv_files = glob.glob('./Data/LoanStats*.csv')
print 'Will merge the following files:'
print csv_files

print 'Loading data...'
df1 = pd.concat(pd.read_csv(f, skip_footer= 2, converters={'int_rate': str}, engine='python') for f in csv_files)
df1 = df1[df1['id'].apply(lambda x: isinstance(x, (int, long)))]
df1['id'] = df1['id'].apply(pd.to_numeric)

print 'Converting interest rate'
def convert_percent(x):
    return float(x.strip('%'))

df1['int_rate'] = df1['int_rate'].apply(convert_percent)

print 'Converting employment length & loan term'
def parse_emp_length(x):
    if 'n/a' in x or '< 1' in x:
        return 0
    else:
        return int(filter(str.isdigit, x))
                      
df1['emp_length'] = df1['emp_length'].apply(parse_emp_length)

df1['term'] = df1['term'].apply(lambda x: int(filter(str.isdigit, x)))

print 'Writing data to lc_data_processed.csv'
df1.to_csv('lc_data_processed.csv')