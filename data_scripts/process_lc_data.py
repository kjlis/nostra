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

print 'Converting interest rate & revolving line utilization'
def convert_percent(x):
	if isinstance(x, str):
		return float(x.strip('%'))
	else:
		return x

df1['int_rate'] = df1['int_rate'].apply(convert_percent)
df1['revol_util'] = df1['revol_util'].apply(convert_percent)

print 'Converting employment length & loan term'
def parse_emp_length(x):
    if 'n/a' in x or '< 1' in x:
        return 0
    else:
        return int(filter(str.isdigit, x))
                      
df1['emp_length'] = df1['emp_length'].apply(parse_emp_length)
df1['term'] = df1['term'].apply(lambda x: int(filter(str.isdigit, x)))

print 'Mapping payment plan to [0, 1]'
df1['pymnt_plan'] = df1['pymnt_plan'].apply(lambda x: 0 if x == 'n' else 1)

print 'Mapping loan statuses'
df1['defaulted'] = df1['loan_status'].apply(lambda x: 1 if x in ['Charged Off', 'Default', 'Late (16-30 days)', 'Late (31-120 days)'] else 0)

print 'Calculating loan to income ratio'
df1['lti'] = df1['loan_amnt']/df1['annual_inc']
df1['lti'] = df1['lti'].replace([np.inf, -np.inf], np.nan)

print 'Writing data to lc_data_processed.csv'
df1.to_csv('lc_data_processed.csv', index= False)