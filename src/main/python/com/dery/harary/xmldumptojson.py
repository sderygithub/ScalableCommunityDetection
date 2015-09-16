import xml
import xmltodict

# Import BeautifulSoup -- try 4 first, fall back to older
try:
    from bs4 import BeautifulSoup
except ImportError:
    try:
        from BeautifulSoup import BeautifulSoup
    except ImportError:
        print('We need BeautifulSoup, sorry...')
        sys.exit(1)

# Transform a filepath into a dict
def xmlfiletodict(filepath):
	with open(filepath) as f:
		data = f.read()
		if data != None:
			return xmltodict.parse(data)
	return None

# Transform a filepath into a BeautifulSoup
def xmlfiletobs(filepath):
	with open(filepath) as f:
		data = f.read()
		if data != None:
			return BeautifulSoup(data)
	return None
